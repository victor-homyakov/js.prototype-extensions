/*global $, Ajax, Element, Node, Prototype */

/**
 * Null-safe Element.remove.
 * Recursive cleanWhitespace.
 * Extensions for Element:
 *   fitToParent, isVisible, insertInto, getOuterHTML, getScrollParent, moveBy, load, attr.
 * Requires element-style.js.
 */
(function () {
  function fitToParent(element, wgap, hgap) {
    element = $(element);
    if (element) {
      // FIXME bug in IE for absolutely positioned elements eo = element.*Offset() gives wrong result
      var p = element.up() /* , pd = p.getDimensions(),*/;
      //var po = p.cumulativeOffset(), eo = element.cumulativeOffset();
      var po = p.viewportOffset(), eo = element.viewportOffset();
      var w = po.left + p.getIntStyles("border-left-width", "padding-left", "width") - (eo.left + element.getIntStyles("border-left-width", "border-right-width", "padding-left", "padding-right", "margin-right") + (wgap || 0));
      var h = po.top + p.getIntStyles("border-top-width", "padding-top", "height") - (eo.top + element.getIntStyles("border-top-width", "border-bottom-width", "padding-top", "padding-bottom", "margin-bottom") + (hgap || 0));
      element.setStyle({
        width: w + "px",
        height: h + "px"
      });
    }
    return element;
  }

  function remove(element) {
    element = $(element);
    var parent = element.parentNode;
    if (parent) {
      parent.removeChild(element);
    }
    return element;
  }

  // var getStyle = Element.getStyle;
  var getStyle = Prototype.Browser.IE ? (function getStyleIE(element, style) {
    return element.style[style] || (element.currentStyle ? element.currentStyle[style] : null);
  }) : (function getStyleDOM(element, style) {
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      return css ? css[style] : null;
    }
    return value;
  });

  /**
   * Test if element is visible. Element is not visible if:
   *   - element is detached from document;
   *   - element or one of its parent nodes has style display:none;
   *   - element or one of its parent nodes has style visibility:hidden
   *
   * @param {HTMLElement,String} element
   * @return {Boolean} false if element is not visible
   */
  function isVisible(element) {
    if (element === window) {
      // assume window is always visible
      return true;
    }
    element = $(element);
    //return (element.offsetWidth && element.offsetHeight) || (element.clientWidth && element.clientHeight);
    if (!element) {
      return false;
    }
    while (true) {
      if (element === document.body || element === document.documentElement || element === window) {
        return true;
      }
      var parent = element.parentNode;
      if (!parent || getStyle(element, 'display') === 'none' || getStyle(element, 'visibility') === 'hidden') {
        return false;
      }
      element = parent;
    }
  }

  function insertInto(element, target, position) {
    element = $(element);
    var insertion = {};
    insertion[position || "bottom"] = element;
    Element.insert(target, insertion);
    return element;
  }

  /**
   * Recursive cleanWhitespace.
   * FIXME invoke cleanWhitespace recursively only for nested block elements
   * div|dl|fieldset|form|h[1-6]|ol|p|ul
   * table|tbody|td|tfoot|th|thead|tr
   *
   * @param {Element/String} element
   * @param {Boolean} recursive
   */
  function cleanWhitespace(element, recursive) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !(/\S/).test(node.nodeValue)) {
        element.removeChild(node);
      } else if (recursive && node.nodeType == 1) {
        cleanWhitespace(node, true);
      }
      node = nextNode;
    }
    return element;
  }

  function getOuterHTML(element) {
    return $(element).outerHTML;
  }

  function getSimulatedOuterHTML(element) {
    element = $(element);
    var attrs = [], tag = element.tagName.toLowerCase(), outerHTML = '<' + tag;

    for (var a, i = 0, len = element.attributes.length; i < len; ++i) {
      a = element.attributes[i];
      attrs.push(a.nodeName + '="' + a.nodeValue + '"');
    }
    if (attrs.length > 0) {
      outerHTML += ' ' + attrs.join(' ');
    }

    if (/*element.childNodes.length === 0 && */
      (/br|hr|img|input|link|meta|param/).test(tag)) {
      outerHTML += '>';
    } else {
      outerHTML += '>' + element.innerHTML + '<' + '/' + tag + '>';
    }
    return outerHTML;
  }

  function getScrollParent(element) {
    for (var parent = element.parentNode; parent; parent = parent.parentNode) {
      //var o = Element.getStyle(parent, "overflow");
      //if (!o || o == "scroll") {return parent;}
      if (parent.scrollHeight > parent.offsetHeight) {
        parent = $(parent);
        var overflow = Element.getStyle(parent, "overflow");
        if (!overflow || overflow == "scroll") {
          // overflow:auto, overflow:scroll
          return parent;
        }
      }
    }
    return $(document.documentElement || document.body);
  }

  function moveBy(element, dx, dy) {
    element = $(element);
    if (element) {
      var left, top;
      if (dx) {
        left = (/^(-?\d+(\.\d+)?)(.+)$/).exec(element.getStyle("left"));
      }
      if (dy) {
        top = (/^(-?\d+(\.\d+)?)(.+)$/).exec(element.getStyle("top"));
      }
      if (dx && left) {
        element.style.left = dx + parseFloat(left[1]) + left[3];
      }
      if (dy && top) {
        element.style.top = dy + parseFloat(top[1]) + top[3];
      }
      /*
       if (dx || dy) {
       var offset = element.positionedOffset();
       if (dx && offset.left) {
       element.style.left = dx + offset.left + "px";
       }
       if (dy && offset.top) {
       element.style.top = dy + offset.top + "px";
       }
       }
       */
    }
    return element;
  }

  function load(element, url, options) {
    element = $(element);
    new Ajax.Updater(element, url, options);
    return element;
  }

  function attr(element, name, value) {
    if (arguments.length === 3 || typeof name === 'object') {
      return Element.writeAttribute(element, name, value);
    } else {
      return Element.readAttribute(element, name);
    }
  }


  Object.extend(Element.Methods, {
    fitToParent: fitToParent,
    remove: remove,
    isVisible: isVisible,
    insertInto: insertInto,
    cleanWhitespace: cleanWhitespace,
    getOuterHTML: document.createElement("a").outerHTML ? getOuterHTML : getSimulatedOuterHTML,
    getScrollParent: getScrollParent,
    moveBy: moveBy,
    load: load,
    attr: attr
  });
})();


Element.focus = function (element) {
  element = $(element);
  if (element && element.focus) {
    try {
      element.focus();
    } catch (e) {
      // IE can throw error for invisible element
    }
  }
  return element;
};


/**
 * Smooth update of DOM subtree.
 */
(function () {
  var ELEMENT = Node.ELEMENT_NODE, TEXT = Node.TEXT_NODE;

  // TODO compare all attributes?
  function compareElements(e1, e2) {
    return e1.tagName === e2.tagName && e1.id === e2.id;
  }

  function fillSrcAttributes(attributes, attrs) {
    for (var i = 0, len = attributes.length; i < len; ++i) {
      var attr = attributes[i];
      if (attr.nodeValue) {
        attrs[attr.nodeName] = attr.nodeValue;
      }
    }
    return len;
  }

  function fillDstAttributes(attributes, attrs) {
    for (var i = 0, len = attributes.length; i < len; ++i) {
      // clear existing dst attributes
      // when corresponding src attribute is undefined
      attrs[attributes[i].nodeName] = null;
    }
    return len;
  }

  function writeAttributes(element, attributes) {
    for (var attr in attributes) {
      var value = attributes[attr];
      if (attr === "checked") {
        element.checked = !!value;
      } else if (attr === "style" && value) {
        element.style.cssText = value/* || "" */;
      } else if (value === false || value === null) {
        element.removeAttribute(attr);
      } else if (value === true) {
        element.setAttribute(attr, attr);
      } else {
        element.setAttribute(attr, value);
      }
    }
  }

  function copyAttributes(src, dst) {
    var attrs = {};
    var len = fillDstAttributes(dst.attributes, attrs) + fillSrcAttributes(src.attributes, attrs);
    if (len > 0) {
      //Element.writeAttribute(dst, attrs);
      writeAttributes(dst, attrs);
    }
  }

  function updateElementNode(sNode, dNode, options) {
    copyAttributes(sNode, dNode);
    // recursion
    if (options.deferred) {
      updateNodes.defer(sNode, dNode, options);
    } else {
      updateNodes(sNode, dNode, options);
    }
    return {
      s: sNode.nextSibling,
      d: dNode.nextSibling
    };
  }

  function updateTextNode(sNode, dNode) {
    if (dNode.nodeValue !== sNode.nodeValue) {
      // replace node value
      dNode.nodeValue = sNode.nodeValue;
    }
    return {
      s: sNode.nextSibling,
      d: dNode.nextSibling
    };
  }

  /**
   * Replace dst.dNode with src.sNode.
   *
   * @param {Node} src - source tree
   * @param {Node} sNode - node in source tree (will be removed and purged)
   * @param {Node} dst - destination tree
   * @param {Node} dNode - node in destination tree (will be moved to src)
   */
  function replaceNode(src, sNode, dst, dNode) {
    //var sNext = sNode.nextSibling;
    var next = {
      s: sNode.nextSibling,
      d: dNode.nextSibling
    };
    src.removeChild(sNode);
    if (dNode.nodeType === ELEMENT) {
      Element.purge(dNode);
    }
    dst.replaceChild(sNode, dNode);
    //return {s: sNext, d: sNode.nextSibling};
    return next;
  }

  function removeDstNode(src, sNode, dst, dNode) {
    var next = dNode.nextSibling;
    if (dNode.nodeType === ELEMENT) {
      Element.purge(dNode);
    }
    dst.removeChild(dNode);
    return {
      s: sNode,
      d: next
    };
  }

  //before: dst.insertBefore(node, element);
  //top: element.insertBefore(node, element.firstChild);
  //bottom: element.appendChild(node);
  //after: dst.insertBefore(node, element.nextSibling);

  /**
   * Copy contents of node.
   *
   * @param {Node} src - source node
   * @param {Node} dst - destination node
   * @param {Object} options - options (unused)
   */
  function updateNodes(src, dst, options) {
    // do not use innerHTML - looking into each nodeType/nodeValue is much faster
    // if (dst.innerHTML === src.innerHTML) {return;}

    var node = {
      s: src.firstChild,
      d: dst.firstChild
    }, next, dType;

    while (node.d && node.s) {
      // skip nodes other than element and text
      dType = node.d.nodeType;
      if (dType !== ELEMENT && dType !== TEXT) {
        node.d = node.d.nextSibling;
        continue;
      }

      switch (node.s.nodeType) {
        case ELEMENT:
          if (dType === ELEMENT) {
            if (compareElements(node.s, node.d)) {
              // node.s -> node.d
              node = updateElementNode(node.s, node.d, options);
              break;
            }

            // guess node insertion
            next = node.s.nextSibling;
            if (next && next.nodeType === ELEMENT && compareElements(next, node.d)) {
              // node.s -> before node.d
              // node.s.next -> node.d
              src.removeChild(node.s);
              dst.insertBefore(node.s, node.d);
              node = updateElementNode(next, node.d, options);
              break;
            }
          }

          // guess node deletion
          next = node.d.nextSibling;
          if (next && next.nodeType === ELEMENT && compareElements(node.s, next)) {
            // node.s -> node.d.next
            // delete node.d
            node = removeDstNode(src, node.s, dst, node.d);
            node = updateElementNode(node.s, node.d, options);
            break;
          }

          // node.s -> node.d
          node = replaceNode(src, node.s, dst, node.d);
          break;

        case TEXT:
          if (dType === TEXT) {
            // node.s.nodeValue -> node.d.nodeValue
            node = updateTextNode(node.s, node.d);
            /*
             if (node.d.nodeValue !== node.s.nodeValue) {
             node.d.nodeValue = node.s.nodeValue;
             }
             node.s = node.s.nextSibling;
             node.d = node.d.nextSibling;
             */
          } else {
            // node.s -> node.d
            node = replaceNode(src, node.s, dst, node.d);
          }
          break;

        default:
          node.s = node.s.nextSibling;
          break;
      }
    }

    while (node.d) {
      // trim extra destination nodes
      node = removeDstNode(src, node.s, dst, node.d);
    }

    while (node.s) {
      // append extra source nodes
      next = node.s.nextSibling;
      src.removeChild(node.s);
      dst.appendChild(node.s);
      node.s = next;
    }

    node.d = node.s = next = null;
    src = null;
  }

  function updateSmoothly(element, content, options) {
    element = $(element);
    if (content && content.toElement) {
      content = content.toElement();
      // content is Element now
    } else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      // content is String now
      content.evalScripts.bind(content).defer();
      content = content.stripScripts();
    }
    content = new Element("div").update(content);
    //options = options || {};
    updateNodes(content, element, options || {});
    //if (!options.deferred) {content.innerHTML = '';}
    //content = null;
    return element;
  }


  Element.Methods.updateSmoothly = updateSmoothly;
})();
