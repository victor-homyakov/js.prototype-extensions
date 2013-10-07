/*global $A, $break */
(function(GLOBAL) {
  function setup(context, eventName) {
    context._observers = context._observers || {};
    context._observers[eventName] = context._observers[eventName] || [];
  }

  GLOBAL.Mixin = GLOBAL.Mixin || {};
  GLOBAL.Mixin.Observable = {
    stopObserving: function(eventName, observer) {
      if (eventName) {
        setup(this, eventName);
        this._observers[eventName] = observer ? this._observers[eventName].without(observer) : [];
      } else {
        this._observers = {};
      }
    },

    observe: function(eventName, observer) {
      if (typeof(eventName) === 'string' && Object.isFunction(observer)) {
        setup(this, eventName);
        var observers = this._observers[eventName];
        if (!observers.include(observer)) {
          observers.push(observer);
        }
      } else {
        for (var e in eventName) {
          this.observe(e, eventName[e]);
        }
      }
    },

    observeOnce: function(eventName, observer) {
      if (typeof(eventName) === 'string' && Object.isFunction(observer)) {
        var inner_observer = (function() {
          observer.apply(this, arguments);
          this.stopObserving(eventName, inner_observer);
        }).bind(this);
        // inlined this.observe(eventName, inner_observer);
        setup(this, eventName);
        this._observers[eventName].push(inner_observer);
      } else {
        for (var e in eventName) {
          this.observeOnce(e, eventName[e]);
        }
      }
    },

    notify: function(eventName) {
      var args = $A(arguments).slice(1);

      setup(this, eventName);
      // Find event observers in this._observers, this and this.options.
      // Original array will be modified after observeOnce calls.
      var observers = this._observers[eventName].clone();
      if (Object.isFunction(this[eventName])) {
        observers.unshift(this[eventName]);
      }
      if (this.options && Object.isFunction(this.options[eventName])) {
        observers.unshift(this.options[eventName]);
      }

      var result = [];
      try {
        for (var i = 0, len = observers.length; i < len; ++i) {
          result.push(observers[i].apply(this, args) || null);
        }
      } catch (e) {
        if (e === $break) {
          return false;
        } else {
          throw e;
        }
      }
      return result;
    }
  };
})(this);
