/*global HTMLElement, Node, XMLSerializer */
if (window.Node && window.XMLSerializer) {
  Node.prototype.__defineGetter__('outerHTML', function() {
    return new XMLSerializer().serializeToString(this);
  });
}

////////////////

if (document.body.__defineGetter__ && typeof(HTMLElement) != "undefined") {
  var element = HTMLElement.prototype;
  if (element.__defineGetter__) {
    /*element.__defineGetter__("outerHTML", function() {
     var span = document.createElement("span");
     span.appendChild(this.cloneNode(true));
     return span.innerHTML;
     });*/
    // slower than attribute enumeration
    element.__defineGetter__("outerHTML", function() {
      var parent = this.parentNode, el = document.createElement(parent.tagName);
      el.appendChild(this); // может быть потеря фокуса
      var shtml = el.innerHTML;
      parent.appendChild(this);
      return shtml;
    });
  }

  if (element.__defineSetter__) {
    /*element.__defineSetter__("outerHTML", function(html) {
     var parent = this.parentNode, range = document.createRange();
     this.innerHTML = html;
     range.selectNodeContents(this);
     var documentFragment = range.extractContents();
     parent.insertBefore(documentFragment, this);
     parent.removeChild(this);
     });*/
    element.__defineSetter__("outerHTML", function(html) {
      var parent = this.parentNode, el = document.createElement('div');
      el.innerHTML = html;
      var range = document.createRange();
      range.selectNodeContents(el);
      var documentFragment = range.extractContents();
      parent.insertBefore(documentFragment, this);
      parent.removeChild(this);
    });
  }
}

////////////////

if (typeof(HTMLElement) != "undefined") {
  var _emptyTags = {
    "IMG": true,
    "BR": true,
    "INPUT": true,
    "META": true,
    "LINK": true,
    "PARAM": true,
    "HR": true
  };

  // faster than DOM manipulation
  HTMLElement.prototype.__defineGetter__("outerHTML", function() {
    var attrs = this.attributes;
    var str = "<" + this.tagName;
    for (var i = 0; i < attrs.length; i++) {
      str += " " + attrs[i].name + "=\"" + attrs[i].value + "\"";
    }
    if (_emptyTags[this.tagName]) {
      return str + ">";
    }
    return str + ">" + this.innerHTML + "</" + this.tagName + ">";
  });

  // works only with 1 node in sHTML
  HTMLElement.prototype.__defineSetter__("outerHTML", function(sHTML) {
    var range = this.ownerDocument.createRange();
    range.setStartBefore(this);
    var documentFragment = range.createContextualFragment(sHTML);
    this.parentNode.replaceChild(documentFragment, this);
  });
}
