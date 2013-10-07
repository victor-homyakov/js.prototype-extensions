/*global $, Element, Event */

// TODO simulate "change" events in non-IE non-Opera browsers
// on "select" when pressing up-down keys?
// onkeydown="window.setTimeout(function(e0){return function() {changeIt(e0)}}(this),0)"

// TODO simulate "change" events in IE browsers
// on "radio" with "propertychange" event

/**
 * Extensions for Event.
 */
Object.extend(Event, {
  KEY_ENTER: 13,
  KEY_SHIFT: 16,
  KEY_CTRL: 17,
  KEY_ALT: 18,
  KEY_SPACE: 32,

  KEY_0: 48,
  KEY_1: 49,
  KEY_2: 50,
  KEY_3: 51,
  KEY_4: 52,
  KEY_5: 53,
  KEY_6: 54,
  KEY_7: 55,
  KEY_8: 56,
  KEY_9: 57,

  KEY_F1: 112,
  KEY_F2: 113,
  KEY_F3: 114,
  KEY_F4: 115,
  KEY_F5: 116,
  KEY_F6: 117,
  KEY_F7: 118,
  KEY_F8: 119,
  KEY_F9: 120,
  KEY_F10: 121,
  KEY_F11: 122,
  KEY_F12: 123,

  /**
   * Faster than findElement if you need to find element only by tag name.
   *
   * @param {Event} event - event
   * @param {String} tagName - name of the tag to find
   * @return {Element}
   */
  findElementByTag: function(/*Event*/event, tagName) {
    tagName = tagName.toLowerCase();
    var element = Event.element(event);
    while (element) {
      if (element.nodeType === 1 && element.tagName && element.tagName.toLowerCase() === tagName) {
        return Element.extend(element);
      }
      element = element.parentNode;
    }
  },

  /**
   * Observe the first occurrence of event and remove observer after that.
   *
   * @param {Element,String} element
   * @param {String} eventName
   * @param {Function} handler
   */
  observeOnce: function(element, eventName, handler) {
    var internalHandler = function() {
      handler.apply(this, arguments);
      Element.stopObserving(element, eventName, internalHandler);
    };
    return Element.observe(element, eventName, internalHandler);
  },

  /*isSupported: function (eventName, element) {
  element = element || document.documentElement;
  return ("on" + eventName) in element;
  },*/

  /**
   * Technique from Juriy Zaytsev
   * http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
   *
   * @param {String} eventName
   * @param {HTMLElement} [element]
   * @return {Boolean} true if event is supported
   *
   * Examples:
   *
   *     if (Event.isSupported("click")) ; // test click on div element
   *     if (Event.isSupported("submit")) ; // test submit on form element
   *     if (Event.isSupported("submit", "div")) ; // test submit on div element
   *     if (Event.isSupported("unload", window)) ; // test window unload event
   *
   * Note that `isSupported` can give false positives when passed augmented host objects, e.g.:
   *
   *     someElement.onfoo = function(){ };
   *     Event.isSupported('foo', someElement); // true (even if "foo" is not supported)
   *
   * Also note that in Gecko clients (those that utilize `setAttribute`-based detection)
   *
   *     Event.isSupported('foo', someElement);
   *
   * might create `someElement.foo` property (if "foo" event is supported) which apparently
   * can not be deleted - `isEventSupported` sets such property to `undefined` value,
   * but can not fully remove it.
   */
  isSupported: (function(undef) {

    var TAGNAMES = {
      'select': 'input',
      'change': 'input',
      'submit': 'form',
      'reset': 'form',
      'error': 'img',
      'load': 'img',
      'abort': 'img'
    };

    function isEventSupported(eventName, element) {
      //element = element || document.createElement(TAGNAMES[eventName] || 'div');
      if (!element || Object.isString(element)) {
        element = document.createElement(element || TAGNAMES[eventName] || 'div');
      }
      eventName = 'on' + eventName;
      var isSupported = (eventName in element);

      if (!isSupported) {
        // if it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
        if (!element.setAttribute) {
          element = document.createElement('div');
        }
        if (element.setAttribute && element.removeAttribute) {
          element.setAttribute(eventName, '');
          //element.setAttribute(eventName, 'return;');
          isSupported = typeof element[eventName] === 'function';

          // if property was created, "remove it" (by setting value to `undefined`)
          if (typeof element[eventName] !== 'undefined') {
            element[eventName] = undef;
          }
          element.removeAttribute(eventName);
        }
      }

      element = null;
      return isSupported;
    }

    return isEventSupported;
  })()
});

Element.Methods.observeOnce = Event.observeOnce;
document.observeOnce = Event.observeOnce.methodize();


/**
 * Event.simulate(element, eventName, options) -> Element
 *
 * $('foo').simulate('click'); // => fires "click" event on an element with id=foo
 *
 * @param {Element} element - element to fire event on
 * @param {String} eventName - name of event to fire
 *   (only HTMLEvents, MouseEvents and partly KeyEvents interfaces are supported)
 * @param {Object} options - optional object to fine-tune event properties
 *   - pointerX, pointerY, ctrlKey, etc.
 */
(function() {
  var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    keyCode: 0,
    charCode: 0,
    bubbles: true,
    cancelable: true
  };

  function createEventIE(options, element) {
    return Object.extend(document.createEventObject(), Object.extend(options, {
      detail: 0,
      screenX: options.pointerX,
      screenY: options.pointerY,
      clientX: options.pointerX,
      clientY: options.pointerY,
      relatedTarget: element
    }));
  }

  function createEventUnsupported() {
    throw new Error('This browser does not support neither document.createEvent() nor document.createEventObject()');
  }

  var createEventOther = document.createEventObject ? createEventIE : createEventUnsupported;

  var eventHandlers = {
    "HTMLEvents": {
      name: /^(?:load|unload|abort|error|select|input|change|submit|reset|focus|blur|resize|scroll)$/,
      createEvent: document.createEvent ? function(options, element, eventName) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, options.bubbles, options.cancelable);
        return event;
      } : createEventOther
    },
    "MouseEvents": {
      name: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
      createEvent: document.createEvent ? function(options, element, eventName) {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        return event;
      } : createEventOther
    }

    // keypress simulation doesn't work in latest versions of Chrome, Firefox, Opera
    /*"KeyEvents": {
     name: /^(?:keydown|keypress|keyup)$/,
     createEvent: document.createEvent ? function (options, element, eventName) {
     var event;
     try {
     event = document.createEvent("KeyEvents");
     event.initKeyEvent(eventName, options.bubbles, options.cancelable, window,
     options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
     options.keyCode, options.charCode);
     } catch (e4) {
     //try {
     //  event = document.createEvent("KeyboardEvents");
     //  event.initKeyboardEvent(eventName, options.bubbles, options.cancelable, window,
     //    options.charArg, options.keyArg, options.location || 0, "");
     //  // location: 0=standard, 1=left, 2=right, 3=numpad, 4=mobile, 5=joystick
     //  // modifiersList: space-separated Shift, Control, Alt, etc.
     //} catch (e3) {
     //}
     try {
     event = document.createEvent("Events");
     } catch (e2) {
     event = document.createEvent("UIEvents");
     } finally {
     event.initEvent(eventName, true, true);
     try {
     Object.extend(event, options);
     } catch (e1) {
     // ignore
     }
     }
     }
     return event;
     } : createEventOther
     }*/
    /*"TextEvent": {
     name: /^textInput$/,
     createEvent: document.createEvent ? function (options, element, eventName) {
     var event = document.createEvent("TextEvent");
     event.initTextEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.charCode);
     return event;
     } : createEventOther
     }*/
  };

  function dispatchEvent(element, event, eventName) {
    if (event) {
      if (element.dispatchEvent) {
        element.dispatchEvent(event);
      } else if (element.fireEvent) {
        // IE-specific sourceIndex makes sure element is in the document
        // if (element.sourceIndex > 0)
        element.fireEvent('on' + eventName, event);
      }
    }
    return element;
  }

  function simulate(element, eventName, options) {
    for (var eventType in eventHandlers) {
      if (eventHandlers[eventType].name.test(eventName)) {
        element = $(element);
        options = Object.extend(Object.clone(defaultOptions), options || {});
        var event = eventHandlers[eventType].createEvent(options, element, eventName);
        return dispatchEvent(element, event, eventName);
      }
    }
    //throw new SyntaxError('Only HTMLEvents, MouseEvents and KeyEvents interfaces are supported');
    throw new SyntaxError('Unsupported event "' + eventName + '". Only HTMLEvents and MouseEvents interfaces are supported');
  }


  Event.simulate = simulate;
  Element.Methods.simulate = simulate;
})();


/**
 * Make change and submit events bubble in all browsers.
 */
(function() {
  var EMULATED_SUBMIT = "emulated:submit", EMULATED_CHANGE = "emulated:change";

  function notForm(element) {
    return !Object.isElement(element) || element.nodeName.toUpperCase() !== "FORM";
  }

  function notField(element) {
    if (!Object.isElement(element)) {
      return true;
    }
    var name = element.nodeName.toUpperCase();
    return !(name === "INPUT" || name === "SELECT" || name === "TEXTAREA");
  }

  //var div = document.createElement("div");
  var submitBubbles = Event.isSupported("submit", "div");
  var changeBubbles = Event.isSupported("change", "div");
  //div = null;

  // is the handler being attached to an element that doesn't support this event?
  // "submit" not on HTMLFormElement => "emulated:submit"
  // "change" not on Field => "emulated:change"
  function correctEventName(eventName, element) {
    if (!submitBubbles && eventName === "submit" && notForm(element)) {
      return EMULATED_SUBMIT;
    } else if (!changeBubbles && eventName === "change" && notField(element)) {
      return EMULATED_CHANGE;
    }
    return eventName;
  }

  if (!submitBubbles || !changeBubbles) {
    // augment the Event.Handler class to observe custom events when needed
    Event.Handler.prototype.initialize = Event.Handler.prototype.initialize.wrap(function(initialize, element, eventName, selector, callback) {
      element = $(element);
      initialize(element, correctEventName(eventName, element), selector, callback);
    });
    // augment the Event.observe method
    Event.observe = Event.observe.wrap(function(observe, element, eventName, handler) {
      element = $(element);
      return observe(element, correctEventName(eventName, element), handler);
    });
    Element.Methods.observe = Event.observe;
    document.observe = Event.observe.methodize();
  }

  if (!submitBubbles) {
    // discover forms on the page by observing focus events which always bubble
    document.on("focusin", "form", function(focusEvent, form) {
      // special handler for the real "submit" event (one-time operation)
      if (!form.retrieve(EMULATED_SUBMIT)) {
        form.observe("submit", function(submitEvent) {
          var emulated = form.fire(EMULATED_SUBMIT, submitEvent, true);
          // if custom event received preventDefault, cancel the real one too
          if (emulated.returnValue === false) {
            submitEvent.preventDefault();
          }
        });
        form.store(EMULATED_SUBMIT, true);
      }
    });
  }

  if (!changeBubbles) {
    // discover form inputs on the page
    document.on("focusin", "input, select, textarea", function(focusEvent, input) {
      // special handler for real "change" events
      if (!input.retrieve(EMULATED_CHANGE)) {
        input.observe("change", function(changeEvent) {
          input.fire(EMULATED_CHANGE, changeEvent, true);
        });
        input.store(EMULATED_CHANGE, true);
      }
    });
  }
})();


Event.click = Element.click = function(element) {
  element = $(element);
  if (element.click) {
    element.click();
  } else {
    element.simulate("click");
  }
};


Event.dumpCache = function() {
  var cache = Event.cache, event;
  for (var e in cache) {
    event = cache[e];
    console.log("node:", event.element, event);
  }
};
