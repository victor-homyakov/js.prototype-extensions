/*global $A, Class */
window.Control = window.Control || {};

/**
 * Create a callback list. By default a callback list will act like an event callback list
 * and can be "fired" multiple times.
 * @param {Object} flags
 *   once          will ensure the callback list can only be fired once (like a Deferred)
 *   memory        will keep track of previous values and will call any callback added
 *                 after the list has been fired right away with the latest "memorized"
 *                 values (like a Deferred)
 *   unique        will ensure a callback can only be added once (no duplicate in the list)
 *   stopOnFalse   interrupt callings when a callback returns false
 */
window.Control.Callbacks = Class.create({
  initialize: function(flags) {
    this.flags = flags || {};
    // Actual callback list
    this.list = [];
    // Stack of fire calls for repeatable lists
    this.stack = [];
    // Last fire value (for non-forgettable lists)
    this.memory = undefined;
    // Flag to know if list is currently firing
    this.firing = false;
    // First callback to fire (used internally by add and fireWith)
    this.firingStart = 0;
    // End of the loop when firing
    this.firingLength = 0;
    // Index of currently firing callback (modified by remove if needed)
    this.firingIndex = 0;
  },

  // Add a single callback function to the list
  // if not in unique mode and callback is not already in
  addCallback: function(callback) {
    if (Object.isFunction(callback) && (!this.flags.unique || !this.has(callback))) {
      this.list.push(callback);
    }
  },

  // Add a callback or a collection of callbacks to the list
  add: function() {
    if (this.list) {
      var length = this.list.length;
      $A(arguments).flatten().each(this.addCallback, this);
      // Do we need to add the callbacks to the current firing batch?
      if (this.firing) {
        this.firingLength = this.list.length;
      } else if (this.memory && this.memory !== true) {
        // With memory, if we're not firing then we should call right away,
        // unless previous firing was halted (stopOnFalse)
        this.firingStart = length;
        this.fireCallbacks(this.memory[0], this.memory[1]);
      }
    }
    return this;
  },

  // Remove a single callback from the list
  removeCallback: function(callback) {
    var i = this.list.indexOf(callback);
    while (i >= 0) {
      // Handle firingIndex and firingLength
      if (this.firing) {
        if (i <= this.firingLength) {
          this.firingLength--;
          if (i <= this.firingIndex) {
            this.firingIndex--;
          }
        }
      }
      // Remove the element
      this.list.splice(i, 1);
      // If we have some unicity property then we only need to do this once
      i = this.flags.unique ? -1 : this.list.indexOf(callback);
    }
  },

  // Remove a callback or a collection of callbacks from the list
  remove: function() {
    if (this.list) {
      $A(arguments).flatten().each(this.removeCallback, this);
    }
    return this;
  },

  // Control if a given callback is in the list
  has: function(fn) {
    return this.list && this.list.include(fn);
  },

  // Remove all callbacks from the list
  empty: function() {
    this.list = [];
    return this;
  },

  // Have the list do nothing anymore
  disable: function() {
    this.list = this.stack = this.memory = undefined;
    return this;
  },

  // Is it disabled?
  disabled: function() {
    return !this.list;
  },

  // Lock the list in its current state
  lock: function() {
    this.stack = undefined;
    if (!this.memory || this.memory === true) {
      this.disable();
    }
    return this;
  },

  // Is it locked?
  locked: function() {
    return !this.stack;
  },

  fireCallbacks: function(context, args) {
    args = args || [];
    this.memory = !this.flags.memory || [context, args];
    this.firing = true;
    this.firingIndex = this.firingStart || 0;
    this.firingStart = 0;
    this.firingLength = this.list.length;
    for (; this.list && this.firingIndex < this.firingLength; this.firingIndex++) {
      if (this.list[this.firingIndex].apply(context, args) === false && this.flags.stopOnFalse) {
        this.memory = true; // Mark as halted
        break;
      }
    }
    this.firing = false;
    if (this.list) {
      if (!this.flags.once) {
        if (this.stack && this.stack.length) {
          this.memory = this.stack.shift();
          this.fireWith(this.memory[0], this.memory[1]);
        }
      } else if (this.memory === true) {
        this.disable();
      } else {
        this.list = [];
      }
    }
  },

  // Call all callbacks with the given context and arguments
  fireWith: function(context, args) {
    if (this.stack) {
      if (this.firing) {
        if (!this.flags.once) {
          this.stack.push([context, args]);
        }
      } else if (!(this.flags.once && this.memory)) {
        this.fireCallbacks(context, args);
      }
    }
    return this;
  },

  // Call all the callbacks with the given arguments
  fire: function() {
    return this.fireWith(this, arguments);
  },

  // To know if the callbacks have already been called at least once
  fired: function() {
    return !!this.memory;
  }
});
