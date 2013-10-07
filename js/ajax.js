/*global $, ActiveXObject, Ajax, Class, Prototype, XMLHttpRequest */

/**
 * Provide the XMLHttpRequest for IE.
 * Fix IE XMLHttpRequest doesn't working for local pages ("file:" protocol).
 *
 * http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
 *
 * @return {Function} XMLHttpRequest
 */
Ajax.getTransport = function() {
  var XMLHttpFactories = [
  function() {
    return new XMLHttpRequest();
  },
  function() {
    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
  },
  function() {
    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
  },
  function() {
    return new ActiveXObject("Msxml2.XMLHTTP");
  },
  function() {
    return new XMLHttpRequest();
  }];

  var factory, transport, i = (Prototype.Browser.IE && location.protocol === "file:") ? 1 : 0;
  while (i < XMLHttpFactories.length) {
    try {
      factory = XMLHttpFactories[i++];
      transport = factory();
      // Use memoization to cache the factory
      Ajax.getTransport = factory;
      return transport;
    } catch (e) {
      // ignore
    }
  }

  return null;
};


Ajax.Responders.register({
  onCreate: function(request) {
    request.createdTime = new Date().getTime();
  }
});


Ajax.Request.addMethods({
  aborted: false,
  abortedState: false,

  /**
   * Abort request.
   */
  abort: function() {
    if (this._complete) {
      return false;
    }
    this.transport.onreadystatechange = Prototype.emptyFunction;
    this.aborted = true;
    this.abortedState = this.transport.readyState;

    try {
      this.transport.abort();
    } catch (e) {
      this.dispatchException(e);
      return false;
    }

    this.respondToReadyState(this.transport.readyState);
    return true;
  },

  success: function() {
    var status = this.getStatus();
    return !status || !this.aborted && (status >= 200 && status < 300 || status == 304);
  },

  isScriptContentType: function(response) {
    var contentType = response.getHeader('Content-Type');
    return contentType && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i);
  },

  /**
   * Allows additional Ajax.Responders `onAbort`, `onSuccess` and `onFailure`.
   *
   * Full list of guaranteed responders:
   * `onCreate`, `onException`, `onAbort`, `onSuccess`, `onFailure`, `onComplete`.
   *
   * @param {Number} readyState
   */
  respondToReadyState: function(readyState) {
    if (this._complete) {
      return;
    }
    var state = Ajax.Request.Events[readyState], callbacks = [], response = new Ajax.Response(this);

    if (this.aborted) {
      state = 'Complete';
      callbacks.push('Abort');
      this._complete = true;
      //callbacks.push('Failure');
    } else if (state == 'Complete') {
      this._complete = true;
      callbacks.push(response.status);
      callbacks.push(this.success() ? 'Success' : 'Failure');

      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;

      if (this.options.evalJS == 'force' || (this.options.evalJS && this.isSameOrigin() && this.isScriptContentType(response))) {
        this.evalResponse();
      }
    }

    callbacks.push(state);
    callbacks.each(function(state) {
      try {
        (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
        Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }
    }, this);
  }
});


Ajax.Response.addMethods({
  initialize: function(request) {
    this.request = request;
    this.transport = request.transport;
    this.readyState = this.transport.readyState;
    this.aborted = request.aborted;

    if (this.aborted) {
      this.readyState = request.abortedState; // ? this.transport.readyState;
      this.status = (this.readyState == 2 || this.readyState == 3) ? this.getStatus() : 0;
    } else if ((this.readyState > 2 && !Prototype.Browser.IE) || this.readyState == 4) {
      this.status = this.getStatus();
      this.statusText = this.getStatusText();
      this.headerJSON = this._getHeaderJSON();

      if (this.readyState == 4 || request.options.onInteractive) {
        this.responseText = String.interpret(this.transport.responseText);
      }

      if (this.readyState == 4) {
        var xml = this.transport.responseXML;
        this.responseXML = Object.isUndefined(xml) ? null : xml;
        this.responseJSON = this._getResponseJSON();
      }
    }
  }
});


/**
 * Options:
 *   evalScripts - evaluate scripts in response (default true)
 *   clearTarget - clear container before request (default true)
 *   showLoading - show loading state on container (default true)
 *   loadingClass - CSS class for loading state (default "loading")
 */
Ajax.Updater.addMethods({
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.extend({
      evalScripts: true,
      clearTarget: true,
      showLoading: true,
      loadingClass: "loading"
    }, Object.clone(options));

    options._onCreate = options.onCreate || Prototype.emptyFunction;
    options._onComplete = options.onComplete || Prototype.emptyFunction;
    options.onCreate = this.onCreate.bind(this);
    options.onComplete = this.onComplete.bind(this);

    $super(url, options);
  },

  onCreate: function(response) {
    var target = $(this.container.success), o = this.options;
    if (target) {
      if (o.clearTarget) {
        target.update();
      }
      if (o.showLoading) {
        target.addClassName(o.loadingClass);
      }
    }
    o._onCreate(response);
  },

  onComplete: function(response, json) {
    if (this.updateAllowed()) {
      this.updateContent(response.responseText);
    }
    var target = $(this.container.success), o = this.options;
    if (target && o.showLoading) {
      target.removeClassName(o.loadingClass);
    }
    o._onComplete(response, json);
  },

  updateAllowed: function() {
    if (this.aborted) {
      return false;
    }

    var receiver = $(this.container[this.success() ? 'success' : 'failure']);
    if (!receiver || this.createdTime < receiver.retrieve("ajax_updater_time", 0)) {
      return false;
    }

    receiver.store("ajax_updater_time", this.createdTime);
    return true;
  }
});


/**
 * Periodically performs an Ajax request.
 *
 * @param {String} url
 * @param {Object} options - parameters:
 *   period          - period between requests in seconds (optional, default = 2s)
 *   initialDelay    - delay before first request in seconds (optional, default = 0.01s)
 *   onBeforeRequest - called before each request,
 *                     request will be skipped if callback returns false
 *   onComplete      - called after each successful request
 */
Ajax.PeriodicalRequest = Class.create(Ajax.Base, {
  prebind: ["start", "requestComplete"],
  initialize: function($super, url, options) {
    $super(options);
    var o = this.options;
    this.period = o.period || 2;
    this.request = {};
    this.url = url;
    this.onBeforeRequest = o.onBeforeRequest || Prototype.emptyFunction;
    this.onComplete = o.onComplete || Prototype.emptyFunction;
    o.onComplete = this.requestComplete;
    this.timer = this.start.delay(o.initialDelay || 0.01);
  },

  /**
   * Ajax.PeriodicalRequest#start() -> undefined
   *
   * Starts the periodical request (if it had previously been stopped with
   * Ajax.PeriodicalRequest#stop).
   *
   * Request will be skipped if the `onBeforeRequest` callback returned false.
   */
  start: function() {
    if (this.onBeforeRequest() === false) {
      this.request = {};
      this.requestComplete(this.request);
    } else {
      this.request = new Ajax.Request(this.url, this.options);
    }
  },

  /**
   * Ajax.PeriodicalRequest#stop() -> undefined
   *
   * Stops the periodical request.
   *
   * Also calls the `onComplete` callback, if one has been defined.
   */
  stop: function() {
    if (this.request.options) {
      this.request.options.onComplete = undefined;
    }
    clearTimeout(this.timer);
    this.onComplete.apply(this, arguments);
  },

  requestComplete: function(response) {
    this.timer = this.start.delay(this.period);
  }
});
