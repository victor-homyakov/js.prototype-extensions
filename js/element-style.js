/*global $, Element */

/**
 * Extensions for Element: calculate element margins/borders/paddings as numbers.
 *
 * @deprecated use Element#measure() or Element.Layout.
 */
(function() {
  function parseIntStyle(value) {
    value = parseInt(value || 0, 10);
    return isNaN(value) ? 0 : value;
  }

  /**
   * Return sum of integer style values.
   *
   * @param {Element/String} element
   * @param {String} style ... - name(s) of style property (properties)
   * @return {Number} value or 0 if value cannot be computed/parsed
   */
  var getIntStyles = function(element, style) { // stub
    return 0;
  };

  /**
   * Return integer value of style property.
   *
   * @param {Element/String} element
   * @param {String} style - name of style property
   * @return {Number} value or 0 if value cannot be computed/parsed
   */
  var getIntStyle = function(element, style) { // stub
    return 0;
  };

  // browser-specific integer style retrieval
  if (document.defaultView && document.defaultView.getComputedStyle) { // W3C
    getIntStyles = function(element) {
      element = $(element);
      var arg, value, style = element.style, css, sum = 0;
      for (var i = 1, len = arguments.length; i < len; ++i) {
        arg = arguments[i].camelize();
        value = style[arg];
        if (!value || value == 'auto') {
          css = css || document.defaultView.getComputedStyle(element, null);
          value = css ? css[arg] : 0;
        }
        sum += parseIntStyle(value);
      }
      return sum;
    };
    getIntStyle = function(element, style) {
      element = $(element);
      style = style.camelize();
      var value = element.style[style];
      if (!value || value == 'auto') {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css[style] : 0;
      }
      return parseIntStyle(value);
    };
  } else if (document.documentElement.currentStyle) { // IE
    getIntStyles = function(element) {
      element = $(element);
      var arg, value, style = element.style, currentStyle = element.currentStyle, display = style.display || currentStyle.display, sum = 0;
      for (var i = 1, len = arguments.length; i < len; ++i) {
        arg = arguments[i].camelize();
        value = style[arg] || currentStyle[arg];
        if (value == 'auto') {
          if ((arg == 'width' || arg == 'height' || arg == 'left' || arg == 'top') && (display != 'none')) {
            sum += parseIntStyle(element['offset' + arg.capitalize()]);
          }
        } else {
          sum += parseIntStyle(value);
        }
      }
      return sum;
    };
    getIntStyle = function(element, style) {
      element = $(element);
      style = style.camelize();
      var value = element.style[style] || element.currentStyle[style];
      if (value == 'auto') {
        if ((style == 'width' || style == 'height' || style == 'left' || style == 'top') && (Element.getStyle(element, 'display') != 'none')) {
          return parseIntStyle(element['offset' + style.capitalize()]);
        }
        return 0;
      }
      return parseIntStyle(value);
    };
  }

  /**
   * Return full padding width (margin + border + padding) of element.
   *
   * @param {Element/String} element
   * @return {Number} full padding width
   */
  function getFullPaddingWidth(element) {
    //element = $(element);
    //return getFullPadding(element, "left") + getFullPadding(element, "right");
    return getIntStyles(element, "padding-left", "border-left-width", "margin-left", "padding-right", "border-right-width", "margin-right");
  }

  /**
   * Return full padding height (margin + border + padding) of element.
   *
   * @param {Element/String} element
   * @return {Number} full padding height
   */
  function getFullPaddingHeight(element) {
    //element = $(element);
    //return getFullPadding(element, "top") + getFullPadding(element, "bottom");
    return getIntStyles(element, "padding-top", "border-top-width", "margin-top", "padding-bottom", "border-bottom-width", "margin-bottom");
  }

  Object.extend(Element.Methods, {
    getIntStyle: getIntStyle,
    getIntStyles: getIntStyles,
    getFullPaddingWidth: getFullPaddingWidth,
    getFullPaddingHeight: getFullPaddingHeight
  });
})();
