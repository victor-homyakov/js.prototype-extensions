/**
 * Create a periodical execution of the function with the given timeout in seconds.
 *
 * @param {Number} interval - execution interval in seconds, default 1s
 */
Function.prototype.periodical = function(interval) {
  var args = Array.slice(arguments, 1);
  var timer = new Number(setInterval(this.bind.apply(this, [this].concat(args)), 1000 * (interval || 1)));
  timer.stop = function() {
    clearInterval(this);
  };
  return timer;
};

/**
 * Chain the given function after the current one. Usage:
 *   someFunction.chain(afterFinish)();
 *
 * @param {Function} func - function to execute after the current one
 */
Function.prototype.chain = function(func) {
  var args = Array.slice(arguments, 1), current = this;
  return function() {
    var result = current.apply(current, arguments);
    func.apply(func, args);
    return result;
  };
};

/**
 * Debouncing function from John Hann.
 * http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
 *
 * Debouncing ensures that function is invoked exactly once for an event that may be happening
 * several times over an extended period. As long as the events are occurring fast enough to happen
 * at least once in every detection period, the function will not be invoked.
 *
 * @param {Number} threshold - the detection period in seconds, default 0.1s
 * @param {Boolean} execAsap - whether the signal should happen at the beginning of the detection
 *   period (true) or the end (false)
 *
 * Example uses:
 *
 * // using debounce in a constructor or initialization function to debounce
 * // focus events for a widget (onFocus is the original handler):
 * this.debouncedOnFocus = this.onFocus.debounce(0.5, false);
 * this.inputNode.observe('focus', this.debouncedOnFocus);
 *
 * // to coordinate the debounce of a method for all objects of a certain class, do this:
 * MyClass.prototype.someMethod = function () {
 *   // do something here, but only once
 * }.debounce(0.1, true); // execute at start and use a 100 msec detection period
 *
 * // wait until the user is done moving the mouse, then execute
 * // (using the stand-alone version)
 * document.on('mousemove', function (e) {
 *   // do something here, but only once after mouse cursor stops
 * }.debounce(0.25, false));
 */
Function.prototype.debounce = function(threshold, execAsap) {
  threshold = threshold || 0.1;
  var func = this, timeout;

  return function debounced() {
    var context = this, args = arguments;

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(context, args);
    }

    function delayed() {
      if (!execAsap) {
        func.apply(context, args);
      }
      timeout = null;
    }

    timeout = delayed.delay(threshold);
  };
};

/**
 * Limit the rate at which function is executed.
 *
 * @param {Number} delay - A zero-or-greater delay in seconds. For event callbacks, values
 *   around 100 or 250 (or even higher) are most useful. Default is 0.1s.
 * @param {Boolean} noTrailing - Optional, defaults to false. If noTrailing is true, callback will
 *   only execute every `delay` milliseconds while the throttled-function is being called. If
 *   noTrailing is false or unspecified, callback will be executed one final time after the last
 *   throttled-function call (after the throttled-function has not been called for `delay`
 *   milliseconds, the internal counter is reset).
 */
Function.prototype.throttle = function(delay, noTrailing) {
  delay = 1000 * (delay || 0.1);
  var func = this, timeout, lastExec = 0;

  return function wrapper() {
    var context = this, args = arguments, elapsed = +new Date() - lastExec;

    function exec() {
      lastExec = +new Date();
      func.apply(context, args);
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    if (elapsed > delay) {
      exec();
    } else if (noTrailing !== true) {
      // In trailing throttle mode, since `delay` time has not been
      // exceeded, schedule `func` to execute `delay - elapsed` ms
      // after most recent execution.
      timeout = setTimeout(exec, delay - elapsed);
    }
  };
};

Function.prototype.defer = function() {
  var method = this, args = arguments;
  return window.setTimeout(function() {
    return method.apply(method, args);
  }, 10);
};

Function.prototype.wait = function(context) {
  var method = this, args = Array.slice(arguments, 1);
  //var fn = args.length ? function() {return method.apply(context, args);} : function() {return method.call(context);};
  //return window.setTimeout(fn, 10);
  return window.setTimeout(function() {
    return method.apply(context, args);
  }, 10);
};
