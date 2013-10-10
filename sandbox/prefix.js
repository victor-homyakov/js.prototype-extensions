Prototype.Browser.prefix = (function(b) {
  return b.Gecko ? '-moz-' : b.WebKit ? '-webkit-' : b.Opera ? '-o-' : b.IE ? '-ms-' : '';
})(Prototype.Browser);
