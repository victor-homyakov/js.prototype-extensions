function memoize(fn) {
  return function () {
    var hash = "", i = arguments.length, currentArg = null;
    while (i--) {
      currentArg = arguments[i];
      hash += (currentArg === Object(currentArg)) ?
        JSON.stringify(currentArg) : currentArg;
      fn.memoize || (fn.memoize = {});
    }
    return (hash in fn.memoize) ? fn.memoize[hash] : fn.memoize[hash] = fn.apply(this, arguments);
  };
}
