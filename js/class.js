/*global $A, $w, Class, Prototype */
(function () {
  var IS_DONTENUM_BUGGY = (function () {
    for (var p in {
      toString: 1
    }) {
      if (p === 'toString') {
        return false;
      }
    }
    return true;
  })(), DEFAULT_TOSTRING = Object.prototype.toString, DEFAULT_VALUEOF = Object.prototype.valueOf;

  var module_reserved_names = 'selfExtended|selfIncluded|extend|include';
  var module_reserved_names_extend = new RegExp('^(?:' + module_reserved_names + '|prototype|superclass|subclasses|ancestors)$');
  var module_reserved_names_include = new RegExp('^(?:' + module_reserved_names + '|constructor)$');

  function clearModuleNames(module, extend) {
    if (!module) {
      return [];
    }
    var reserved = extend ? module_reserved_names_extend : module_reserved_names_include;
    var names = Object.keys(module).select(function (value) {
      return !reserved.test(value);
    });

    if (IS_DONTENUM_BUGGY) {
      // Note: property constructor|toString|valueOf may be already present in names
      // They will be duplicated - better than no properties and faster than check for duplicates
      if (extend && !Object.isUndefined(module.constructor)) {
        names.push("constructor");
      }
      if (module.toString != DEFAULT_TOSTRING) {
        names.push("toString");
      }
      if (module.valueOf != DEFAULT_VALUEOF) {
        names.push("valueOf");
      }
    }
    return names;
  }

  /**
   * Extend `this` with `module`.
   * Invoke callback `module.selfExtended(this)` after extension.
   *
   * @param {Object} module
   */
  function extendWithModule(module) {
    //if(isObject(module))
    var names = clearModuleNames(module, true);
    for (var i = 0, length = names.length; i < length; i++) {
      this[names[i]] = module[names[i]];
    }
    if (module.selfExtended) {
      module.selfExtended(this);
    }
  }

  function findClassWithMethod(name, klasses) {
    for (var i = 0, l = klasses.length; i < l; i++) {
      if (name in klasses[i].prototype) {
        return klasses[i];
      }
    }
  }

  function wrap(superMethod, method) {
    var wrappedMethod = superMethod.wrap(method);
    wrappedMethod.valueOf = method.valueOf.bind(method);
    wrappedMethod.toString = method.toString.bind(method);
    return wrappedMethod;
  }

  function bindSuper(method, name, klass) {
    if (name in klass.prototype) {
      // bind $super to the method of previously included module
      method = wrap((function (m) {
        return function () {
          return m.apply(this, arguments);
        };
      })(klass.prototype[name]), method);
    } else {
      var ancestor = findClassWithMethod(name, klass.ancestors);
      if (ancestor) {
        // bind $super to the method of ancestor module
        method = wrap((function (p, n) {
          return function () {
            return p[n].apply(this, arguments);
          };
        })(ancestor.prototype, name), method);
      }
    }
    return method;
  }

  /**
   * Include `module` into `this.prototype`.
   * Invoke callback `module.selfIncluded(this)` after inclusion.
   *
   * @param {Object} module
   */
  function includeModule(module) {
    var names = clearModuleNames(module, false), name, method;
    for (var i = 0, length = names.length; i < length; i++) {
      name = names[i];
      method = module[name];
      if (Object.isFunction(method) && method.argumentNames()[0] == "$super") {
        method = bindSuper(method, name, this);
      }
      this.prototype[name] = method;
    }
    if (module.selfIncluded) {
      module.selfIncluded(this);
    }
  }

  /**
   * Extend the class-level with the given objects (modules).
   *
   * NOTE: this method _WILL_OVERWRITE_ the existing intersecting entries
   *
   * NOTE: this method _WILL_NOT_OVERWRITE_ the class prototype and
   * the class 'ancestors' and 'superclass' attributes. If one of those
   * exists in one of the received modules, the attribute will be
   * skipped
   *
   * @param {Object} module ... - module to extend with
   * @return Class the klass
   */
  function extend(module) {
    $A(arguments).each(extendWithModule, this);
    return this;
  }

  /**
   * Extend the class prototype with the given objects (modules).
   *
   * NOTE: this method _WILL_OVERWRITE_ the existing intersecting entries
   * NOTE: this method _WILL_NOT_OVERWRITE_ the 'klass' attribute of the klass.prototype
   *
   * @param {Object} module ... - module to include into prototype
   * @return Class the klass
   */
  function include(module) {
    $A(arguments).each(includeModule, this);
    return this;
  }

  function toString() {
    return "Class {" + clearModuleNames(this.prototype).join(", ") + "}";
  }

  Object.extend(Class.Methods, {
    extend: extend,
    include: include,
    // addMethods: include,
    clearModuleNames: clearModuleNames,
    toString: toString
  });

  function Subclass() {
    // empty
  }

  Class.create = function () {
    var modules = $A(arguments), parent = Object.isFunction(modules[0]) ? modules.shift() : null;
    var i, length = modules.length;

    function klass() {
      var prebind = this.prebind, methodName, method;
      if (prebind && Object.isArray(prebind)) {
        for (var i = 0, length = prebind.length; i < length; i++) {
          methodName = prebind[i];
          method = this[methodName];
          if (!method) {
            throw new Error("Method '" + methodName + "' not found in Class - cannot make prebind.");
          } else if (!Object.isFunction(method)) {
            throw new Error("Property '" + methodName + "' of Class is not a function - cannot make prebind.");
          } else {
            this[methodName] = method.bind(this);
          }
        }
      }
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      Subclass.prototype = parent.prototype;
      klass.prototype = new Subclass();
      parent.subclasses.push(klass);
    }

    // collecting the list of ancestors
    klass.ancestors = [];
    while (parent) {
      klass.ancestors.push(parent);
      parent = parent.superclass;
    }

    // handling the module injections
    for (i = 0; i < length; i++) {
      if (Object.isArray(modules[i].extend)) {
        klass.extend.apply(klass, modules[i].extend);
      }
      if (Object.isArray(modules[i].include)) {
        klass.include.apply(klass, modules[i].include);
      }
    }

    modules.each(includeModule, klass);
    //for (i = 0; i < length; i++) {klass.includeModule(modules[i]);}
    //klass.include.apply(klass, modules);

    // default initialize method
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = Prototype.emptyFunction;
    }

    klass.prototype.constructor = klass;
    return klass;
  };

  // add new class methods to already existing classes
  [PeriodicalExecuter, Template, Hash, ObjectRange, //
    Ajax.Base, Ajax.Request, Ajax.Response, Ajax.Updater, Ajax.PeriodicalUpdater, //
    Element.Layout, Element.Offset, Abstract.TimedObserver, Form.Element.Observer, //
    Form.Observer, Abstract.EventObserver, Form.Element.EventObserver, //
    Form.EventObserver, Event.Handler].each(function (module) {
      Object.extend(module, Class.Methods);
    });
})();
