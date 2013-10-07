/**
 * Extensions for Object: type detection methods, conversion from HTML-escaped JSON.
 */
(function() {
  var _toString = Object.prototype.toString;

  function isBoolean(object) {
    return typeof object === "boolean" || _toString.call(object) === "[object Boolean]";
  }

  function isObject(object) {
    return typeof object === "object";
  }

  /**
   * Evaluate HTML-escaped JSON string.
   *
   * Pre-process JSON string (unescape HTML-escaped quotes, double quotes, ampersands;
   * escape CRs, LFs in multiline values) and return evaluated object.
   *
   * @param {String} s - HTML-escaped JSON string
   */
  function fromJSON(s) {
    return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/&amp;/g, "&").evalJSON();
  }

  Object.extend(Object, {
    isBoolean: isBoolean,
    isObject: isObject,
    fromJSON: fromJSON
  });
})();
