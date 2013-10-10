/*global $, Element */

Element.addMethods('iframe', {
  // get window and document objects for iframe (IE compatible)
  window: function(iframe) {
    iframe = $(iframe);
    return iframe.contentWindow || iframe.contentDocument.defaultView;
  },
  getWindow: function(iframe) {
    iframe = $(iframe);
    return iframe.contentWindow || iframe.contentDocument.defaultView;
  },
  document: function(iframe) {
    iframe = $(iframe);
    return iframe.contentDocument || iframe.contentWindow.document;
  },
  getDocument: function(iframe) {
    iframe = $(iframe);
    return iframe.contentDocument || iframe.contentWindow.document;
  },
  $: function(iframe, element) {
    iframe = $(iframe);
    var frameDocument = iframe.document();
    if (arguments.length > 2) {
      for (var i = 1, frameElements = [], length = arguments.length; i < length; i++) {
        frameElements.push(iframe.$(arguments[i]));
      }
      return frameElements;
    }
    if (Object.isString(element)) {
      element = frameDocument.getElementById(element);
    }
    return element || iframe;
  }
});

Prototype.extendFrame = function(iframe) {
  iframe = $(iframe);
  var proto = iframe.contentWindow.Element.prototype, methods = Element.Methods;
  for (var m in methods) {
    if (Object.isFunction(methods[m])) {
      proto[m] = methods[m].methodize();
    }
  }
};

$(document.body).insert('<iframe id="test">');
Prototype.extendFrame('test');
$('test').contentDocument.body.insert('div'); // => <div>
//



var iframe = $('iframe');
var iframeElement = iframe.$('iframeElement');
Event.observe(iframeElement, 'mouseup', function() {
  console.log('yup');
});
Event.observe($('iframe').$('iframeElement'), 'mouseup', function() {
  console.log('yup2');
});
Event.observe($('iframe').document(), 'mouseup', function() {
  console.log('yup3');
});
$('iframe').$('iframeElement').update('some text'); // -> error (no method)
// [Element.extend cannot be called on the iframe element before it is returned]


var iframe = $('myiframe');
Element.extend(iframe.document());
iframe.document().body.insert('<div>hello</div>'); // fail, wrong document
iframe.window().Element.extend(iframe.document()); // use the copy of Prototype in the iframe's window
iframe.document().body.insert('<div>hello</div>'); // ok
//


frame = (function() {
  var frames = document.getElementsByTagName('iframe');
  for (var i = 0; i < frames.length; i++) {
    iframe = frames[i];
    var idoc = iframe.contentDocument || iframe.contentWindow.document;
    var iwin = iframe.contentWindow || iframe.contentDocument.defaultView;
    if (iwin.Prototype) {
      Element.extend(idoc);
      iwin.Element.extend(idoc);
      console.log('use frame.$ and frame.$$ to access frame elements');
      return iwin;
    }
  }
  console.log('no frames are using Prototype');
})();
