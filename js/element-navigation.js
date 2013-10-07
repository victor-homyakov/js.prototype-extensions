/*global $, Element, Prototype */

/**
 * Optimization of Element.next, Element.previous, Element.up.
 */
(function() {
  // Use the Element Traversal API if available
  var nextElement = 'nextElementSibling', previousElement = 'previousElementSibling';
  var parentElement = 'parentElement', childElements = 'children';

  // Fall back to the DOM Level 1 API
  var root = document.documentElement;
  if (!(nextElement in root)) {
    nextElement = 'nextSibling';
  }
  if (!(previousElement in root)) {
    previousElement = 'previousSibling';
  }
  if (!(parentElement in root)) {
    parentElement = 'parentNode';
  }
  if (!(childElements in root)) {
    childElements = 'childNodes';
  }

  var EmptySelector = {
    match: function() {
      return true;
    }
  };

  /**
   * Traverse elements.
   *
   * @param {Element} element - element to traverse from
   * @param {String} method - traversal method (next|previous)(Element)?Sibling, parent(Element|Node)
   * @param {String} expression - CSS expression
   * @param {Number} [index=0] - index (starting from 0)
   */
  function traverse(element, method, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) {
      index = expression;
      expression = null;
    }
    if (!Object.isNumber(index)) {
      index = 0;
    }
    var node = element[method], selector = expression ? Prototype.Selector : EmptySelector;
    while (node) {
      if (node.nodeType === 1 && selector.match(node, expression) && (index-- === 0)) {
        return Element.extend(node);
      }
      node = node[method];
    }
    //return undefined;
  }

  function next(element, expression, index) {
    return traverse(element, nextElement, expression, index);
  }

  function previous(element, expression, index) {
    return traverse(element, previousElement, expression, index);
  }

  function up(element, expression, index) {
    return (arguments.length === 1) ? Element.extend($(element).parentNode) : traverse(element, parentElement, expression, index);
  }

  Object.extend(Element.Methods, {
    next: next,
    previous: previous,
    up: up
  });
})();


/**
 * Extensions for Element:
 *   lastDescendant, getFocusableElements, getSuccessfulElements.
 */
(function() {
  function lastDescendant(element) {
    element = $(element).lastChild;
    while (element && element.nodeType !== 1) {
      element = element.previousSibling;
    }
    return $(element);
  }

  // TODO focusable: area|frame|iframe|label|html|object
  function isFocusableInternal(element) {
    return element.tagName && !element.disabled && "hidden" !== element.type &&
    (/^(?:a|input|select|textarea|button)$/i).test(element.tagName);
  }

  function isFocusable(element) {
    return isFocusableInternal($(element));
  }

  /**
   * Element#getFocusableElements(@root) -> Array
   *
   * Return array of elements which under some circumstances may have focus.
   *
   * @param {Element} root
   */
  function getFocusableElements(root) {
    var elements = $(root).getElementsByTagName('*'), element, arr = [], i = 0;
    while (element = elements[i++]) {
      if (isFocusableInternal(element)) {
        arr.push(Element.extend(element));
      }
    }
    return arr;
  }

  function getFirstFocusableElement(root) {
    var focusableElements = getFocusableElements(root);
    if (focusableElements.length > 0) {
      return focusableElements.find(function(e) {
        return e.autofocus; // e.hasAttribute("autofocus")
      }) || focusableElements.find(function(e) {
        return e.tabIndex === 1;
      }) || focusableElements.first();
    }
  }

  /**
   * Element#getSuccessfulElements(@form) -> Array
   *
   * @param {Element} form
   */
  function getSuccessfulElements(form) {
    var elements = $(form).getElementsByTagName('*'), element, arr = [], i = 0;
    var serializers = Field.Serializers;
    while (element = elements[i++]) {
      if (!element.disabled && element.name && serializers[element.tagName.toLowerCase()]) {
        arr.push(Element.extend(element));
      }
    }
    return arr;
  }

  Object.extend(Element.Methods, {
    lastDescendant: lastDescendant,
    isFocusable: isFocusable,
    getFocusableElements: getFocusableElements,
    getFirstFocusableElement: getFirstFocusableElement,
    getSuccessfulElements: getSuccessfulElements
  });
})();
