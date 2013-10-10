Array.fy = function(o) {
  for (var p = Array.prototype, m = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift", "concat", "join", "slice", "indexOf", "lastIndexOf", "filter", "forEach", "every", "map", "some", "reduce", "reduceRight"], i = m.length; i--;) {
    o[m[i]] = p[m[i]];
  }
  return o;
};
Array.fy = (function(p) {
  var m = ["push", "pop", "shift", "unshift", "slice", "splice", "reverse", "sort", "concat", "indexOf", "lastIndexOf", "join", "filter", "forEach", "every", "some", "map", "reduce", "reduceRight"], len = m.length;
  return function(o) {
    for (var i = len; i--;) {
      o[m[i]] = p[m[i]];
    }
    return o;
  };
})(Array.prototype);

Object.extend(String.prototype, {
  /**
   * HTML encode delicate entities.
   */
  HTMLencode: function() {
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  },
  /**
   * HTML decode delicate entities.
   */
  HTMLdecode: function() {
    return this.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
  },
  decodeJSONHTML: function() {
    return this.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/&amp;/g, "&");
  },
  /**
   * @return {String} parameter delimiter needed when adding next parameter to this string
   */
  urlParamDelimiter: function() {
    return (this.indexOf("?") < 0) ? "?" : "&";
  }
});
