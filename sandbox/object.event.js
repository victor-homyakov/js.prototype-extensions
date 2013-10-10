/*global $A, $break */
(function() {
  function isFunction(object) {
    return typeof(object) === "function";
  }

  function setup(context, eventName) {
    context._observers = context._observers || {};
    context._observers[eventName] = context._observers[eventName] || [];
  }

  /**
   * Find event observers in context._observers, context and context.options.
   * @param {Object} context
   * @param {String} eventName
   */
  function findObservers(context, eventName) {
    setup(context, eventName);
    // original array will be modified after observeOnce calls
    var observers = context._observers[eventName].clone();
    if (isFunction(context[eventName])) {
      observers.unshift(context[eventName]);
    }
    if (context.options && isFunction(context.options[eventName])) {
      observers.unshift(context.options[eventName]);
    }
    return observers;
  }

  function notify(observers, context, args) {
    var result = [];
    try {
      for (var i = 0, len = observers.length; i < len; ++i) {
        result.push(observers[i].apply(context, args) || null);
      }
    } catch (e) {
      if (e == $break) {
        return false;
      } else {
        throw e;
      }
    }
    return result;
  }

  function stopObserving(eventName, observer) {
    if (eventName) {
      setup(this, eventName);
      this._observers[eventName] = observer ? this._observers[eventName].without(observer) : [];
    } else {
      this._observers = {};
    }
  }

  function observe(eventName, observer) {
    if (typeof(eventName) == 'string' && isFunction(observer)) {
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
  }

  function observeOnce(eventName, observer) {
    if (typeof(eventName) == 'string' && isFunction(observer)) {
      var inner_observer = (function() {
        observer.apply(this, arguments);
        this.stopObserving(eventName, inner_observer);
      }).bind(this);
      //this.observe(eventName, inner_observer);
      setup(this, eventName);
      this._observers[eventName].push(inner_observer);
    } else {
      for (var e in eventName) {
        this.observeOnce(e, eventName[e]);
      }
    }
  }

  Object.Event = {
    extend: function(object) {
      object.stopObserving = stopObserving;
      object.observe = observe;
      object.observeOnce = observeOnce;
      object.notify = function(eventName) {
        var observers = findObservers(this, eventName);
        return notify(observers, this, $A(arguments).slice(1));
      };
      if (object.prototype) {
        object.prototype.stopObserving = stopObserving;
        object.prototype.observe = observe;
        object.prototype.observeOnce = observeOnce;
        object.prototype.notify = function(eventName) {
          if (isFunction(object.notify)) { // do not call in child classes?
            var args = $A(arguments).slice(1);
            args.unshift(this);
            args.unshift(eventName);
            object.notify.apply(object, args);
          }
          var observers = findObservers(this, eventName);
          return notify(observers, this, $A(arguments).slice(1));
        };
      }
    }
  };
})();
