/*global $A, Class, Event */
window.Control = window.Control || {};

/**
 * Mechanism to execute a series of callbacks in a non-blocking queue. Each callback is executed via
 * setTimeout unless configured with a negative timeout, in which case it is run in blocking mode in
 * the same execution thread as the previous callback.
 *
 * Callbacks can be function references or object literals with the following keys:
 * <ul>
 * <li><code>method</code> - {Function} REQUIRED the callback function.</li>
 * <li><code>scope</code> - {Object} the scope from which to execute the callback. Default is the
 * global window scope.</li>
 * <li><code>argument</code> - {Array} parameters to be passed to method as individual arguments.</li>
 * <li><code>timeout</code> - {Number} millisecond delay to wait after previous callback
 * completion before executing this callback. Negative values cause immediate blocking execution.
 * Default 0.</li>
 * <li><code>until</code> - {Function} boolean function executed before each iteration. Return
 * true to indicate completion and proceed to the next callback.</li>
 * <li><code>iterations</code> - {Number} number of times to execute the callback before
 * proceeding to the next callback in the chain. Incompatible with <code>until</code>.</li>
 * </ul>
 *
 * Events: chain:end - fired when the callback queue is emptied via execution (not via a call to
 * chain.stop())
 *
 * @class Chain
 * @namespace window.Control
 * @constructor
 * @param callback* {Function|Object} Any number of callbacks to initialize the queue
 */
window.Control.Chain = Class.create({
  /**
   * Timeout id used to pause or stop execution and indicate the execution state of the Chain. 0
   * indicates paused or stopped, -1 indicates blocking execution, and any positive number indicates
   * non-blocking execution.
   *
   * @property id
   * @type {number}
   * @private
   */
  id: 0,

  initialize: function() {
    /**
     * The callback queue
     *
     * @property q
     * @type {Array}
     * @private
     */
    this.q = $A(arguments); // = [].slice.call(arguments);
  },

  // Execute immediately
  runSync: function(fn, scope, args, c) {
    this.id = c.timeout;
    if (c.until) {
      while (!c.until()) {
        // Execute until condition is met
        fn.apply(scope, args);
      }
    } else if (c.iterations) {
      while (c.iterations-- > 0) {
        fn.apply(scope, args);
      }
    } else {
      fn.apply(scope, args);
    }
    this.q.shift();
    this.id = 0;
    return this.run();
  },

  runAsync: function(fn, scope, args, c) {
    if (c.until) {
      // If the until condition is set, check if we're done
      if (c.until()) {
        // Shift this callback from the queue and execute the next callback
        this.q.shift();
        return this.run();
      }
    } else if (!c.iterations || !--c.iterations) {
      // Otherwise if either iterations is not set or we're
      // executing the last iteration, shift callback from the queue
      this.q.shift();
    }

    var me = this;
    // Set to execute after the configured timeout
    this.id = setTimeout(function() {
      // Execute the callback from scope, with argument
      fn.apply(scope, args);
      // Check if the Chain was not paused from inside the callback
      if (me.id) {
        // Indicate ready to run state
        me.id = 0;
        // Start the fun all over again
        me.run();
      }
    }, c.timeout || 0);
  },

  /**
   * Begin executing the chain, or resume execution from the last paused position.
   *
   * @method run
   * @return {Chain} the Chain instance
   */
  run: function() {
    // If the Chain is currently in an execution mode, return
    if (this.id) {
      return this;
    }
    // Grab the first callback in the queue
    var c = this.q[0];

    // If there is no callback in the queue, return
    if (!c) {
      Event.fire('chain:end');
      return this;
    }

    var fn = c.method || c;
    if (typeof fn === 'function') {
      var scope = c.scope || {}, args = c.argument || [];

      if (!(args instanceof Array)) {
        args = [args];
      }

      if (c.timeout && c.timeout < 0) {
        // Execute immediately if the callback timeout is negative
        return this.runSync(fn, scope, args, c);
      } else {
        this.runAsync(fn, scope, args, c);
      }
    }

    return this;
  },

  /**
   * Add a callback to the end of the queue.
   *
   * @method add
   * @param c {Function|Object} the callback (function reference or object literal)
   * @return {Chain} the Chain instance
   */
  add: function(c) {
    this.q.push(c);
    return this;
  },

  /**
   * Pause the execution of the Chain after the current execution of the current callback completes.
   * If called interstitially, clears the timeout for the pending callback. Paused Chains can be
   * restarted with chain.run().
   *
   * @method pause
   * @return {Chain} the Chain instance
   */
  pause: function() {
    if (this.id > 0) {
      clearTimeout(this.id);
    }
    this.id = 0;
    return this;
  },

  /**
   * Stop and clear the Chain's queue after the execution of the current callback completes.
   *
   * @method stop
   * @return {Chain} the Chain instance
   */
  stop: function() {
    this.pause();
    this.q = [];
    return this;
  }
});
