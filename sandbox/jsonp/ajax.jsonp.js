/*global $, Ajax, Class, Element, Prototype */

Ajax.JSONP = Class.create({
  DEFAULT_OPTIONS: {
    // use default encoding / encoding of the current document
    // IE supported charsets: http://msdn.microsoft.com/en-us/library/aa752010(VS.85).aspx
    //encoding: undefined,
    callbackParam: "callback",
    onCreate: Prototype.emptyFunction,
    onSuccess: Prototype.emptyFunction,
    onFailure: Prototype.emptyFunction,
    onComplete: Prototype.emptyFunction
  },

  initialize: function(url, options) {
    var o = Object.extend({}, this.DEFAULT_OPTIONS);
    o = Object.extend(o, options || {});
    this.url = url;
    this.options = o;
    o.onCreate();
    this.send(o.parameters);
  },

  send: function(parameters) {
    // TODO no-cache
    //if (nocache) cacheParam = '_=' + (new Date()).getTime();
    var url = this.url;
    //if (Object.isHash(parameters)) {parameters = parameters.toObject();}
    parameters = Object.isString(parameters) ? parameters : Object.toQueryString(parameters);
    if (parameters) {
      url += (url.include('?') ? '&' : '?') + parameters;
    }
    if (this.options.callback) {
      url += (url.include('?') ? '&' : '?') + this.options.callbackParam + '=' + this.options.callback;
    }
    return this.createScript(url);
  },

  head: function() {
    return document.head || document.getElementsByTagName("head")[0];
  },

  createScript: function(src) {
    var o = this.options, js = new Element("script", {
      type: "text/javascript",
      id: Ajax.JSONP.prefix + (++Ajax.JSONP.counter),
      src: src
    });

    if (o.encoding) {
      js.charset = o.encoding;
      // FIXME IE save/overwrite document.charset
      //if (Prototype.Browser.IE && o.encoding !== document.charset) {
      //  try {
      //    var documentCharset = document.charset;
      //    document.charset = o.encoding;
      //    js.documentCharset = documentCharset;
      //    alert("Charset " + js.documentCharset + "->" + o.encoding);
      //  } catch (e) {
      //    throw new Error("Unsupported charset '" + o.encoding + "'");
      //  }
      //}
    }

    var onload = function() {
      o.onSuccess();
      o.onComplete();
    }, onerror = function() {
      o.onFailure();
      o.onComplete();
    };

    // js.observe('load', onload);
    js.onload = onload;
    js.onerror = onerror;
    if (Prototype.Browser.IE) {
      js.onreadystatechange = function onreadystatechange() { // this === js
        // FIXME IE restore document.charset
        //if (this.documentCharset) {
        //  alert("Restore charset " + document.charset + "->" + this.documentCharset);
        //  document.charset = this.documentCharset;
        //}
        var rs = this.readyState; // js.readyState
        if (rs == "complete" || rs == "loaded") {
          this.onload = this.onerror = this.onreadystatechange = null; // cleanup
          //alert("Ready state: " + rs);
          onload();
        }
      };
    }

    this.head().appendChild(js);
    return js;
  },

  removeScript: function(js) {
    if (Object.isNumber(js)) {
      js = Ajax.JSONP.prefix + js;
    }
    $(js).remove();
  }
});

Ajax.JSONP.counter = 0;
Ajax.JSONP.prefix = "jsonp-";
