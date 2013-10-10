var Options = Class.create({
  setOptions: function() {
    // FIXME merge arguments with options
    this.options = merge(this.options, arguments);
    if (this.addEvent) {
      for (var option in this.options) {
        if ($type(this.options[option]) === 'function' && (/^on[A-Z]/).test(option)) {
          this.addEvent(option, this.options[option]);
          delete this.options[option];
        }
      }
    }
    return this;
  }
});
