/*global Class, TestCase, assertArray, assertEquals, assertException, assertFunction, assertInstanceOf, assertUndefined */
TestCase("class.js", {
  testMethods: function() {
    assertFunction(Class.Methods.extend);
    assertFunction(Class.Methods.include);
    assertFunction(Class.create);
  },
  testAncestors: function() {
    var C1 = Class.create();
    assertArray(C1.ancestors);
    assertEquals(0, C1.ancestors.length);

    var C2 = Class.create(C1);
    assertArray(C2.ancestors);
    assertEquals(1, C2.ancestors.length);
    assertEquals(C1, C2.ancestors[0]);
  },
  testPrebind: function() {
    var C1 = Class.create({
      prebind: "should not fail",
      method1: function() {
        return this;
      }
    }), c1 = new C1(), m1 = c1.method1;
    assertEquals(c1, c1.method1());
    assertEquals("Unbound method", window, m1());

    var C2 = Class.create(C1, {
      prebind: ["method1", "method2"],
      method2: function() {
        return this;
      }
    }), c2 = new C2(), m21 = c2.method1, m22 = c2.method2;
    assertEquals(c2, c2.method1());
    assertEquals(c2, m21());
    assertEquals(c2, c2.method2());
    assertEquals(c2, m22());

    assertException("Should throw exception on prebinding of non-existent method", function() {
      var C3 = Class.create({
        prebind: ["non-existent"]
      });
      return new C3();
    });
  },
  testClearModuleNames: function() {
    var clear = Class.Methods.clearModuleNames, names;
    assertArray(clear({}, true));
    assertArray(clear({}, false));

    var module = {
      f1: 0,
      selfExtended: 0,
      selfIncluded: 0,
      extend: 0,
      include: 0,
      prototype: 0,
      superclass: 0,
      subclasses: 0,
      ancestors: 0,
      constructor: 0,
      toString: 0,
      valueOf: 0
    };
    names = clear(module, true);
    assertArray(names);
    assertEquals("extend 4 names", 4, names.length);
    assertEquals("include 4 names", "constructor f1 toString valueOf", names.sort().join(" "));
    /*
     assert(names.include('f1'), 'extend f1');
     assert(names.include('constructor'), 'extend constructor');
     assert(names.include('toString'), 'extend toString');
     assert(names.include('valueOf'), 'extend valueOf');
     */
    names = clear(module, false);
    assertArray(names);
    assertEquals("include 7 names", 7, names.length);
    assertEquals("include 7 names", "ancestors f1 prototype subclasses superclass toString valueOf", names.sort().join(" "));
    /*
     assert(names.include('f1'), "include f1");
     assert(names.include('prototype'), "include prototype");
     assert(names.include('superclass'), "include superclass");
     assert(names.include('subclasses'), "include subclasses");
     assert(names.include('ancestors'), "include ancestors");
     assert(names.include('toString'), "include toString");
     assert(names.include('valueOf'), "include valueOf");
     */
  },
  testExtend: function() {
    var C1 = Class.create({
      extend: [{
        staticConst: "const",
        staticFunction: function() {
          return this.staticConst;
        },
        extend: "should not override existing extend",
        include: "should not override existing include",
        toString: function() {
          return "extended toString";
        },
        valueOf: function() {
          return "extended valueOf";
        }
      }]
    });
    assertEquals("const", C1.staticConst);
    assertFunction(C1.staticFunction);
    assertEquals("const", C1.staticFunction());
    assertFunction(C1.include);
    assertFunction(C1.extend);
    assertEquals("C1.toString", "extended toString", C1.toString());
    assertEquals("C1.valueOf", "extended valueOf", C1.valueOf());

    var c1 = new C1();
    assertUndefined("C1#staticConst", c1.staticConst);
    assertUndefined("C1#staticFunction", c1.staticFunction);
    assertUndefined("C1#extend", c1.extend);
    assertUndefined("C1#include", c1.include);
  },
  testSelfExtended: function() {
    var extended = 0, module = {
      selfExtended: function() {
        extended++;
      }
    }, C1 = Class.create({
      extend: [module]
    });
    assertEquals(1, extended);

    var C2 = Class.create({
      extend: [C1]
    });
    assertEquals(1, extended);

    var C3 = Class.create({
      extend: [module, C1, C2]
    });
    assertEquals(2, extended);
  },
  testInclude: function() {
    var C1 = Class.create({
      include: [{
        aConst: "const",
        aFunction: function() {
          return this.aConst;
        },
        method1: function() {
          return "included method";
        },
        extend: "should not override existing extend",
        include: "should not override existing include",
        toString: function() {
          return "included toString";
        },
        valueOf: function() {
          return "included valueOf";
        }
      }],
      method1: function() {
        return "instance method";
      }
    });
    assertEquals("const", C1.prototype.aConst);
    assertFunction(C1.prototype.aFunction);
    assertUndefined("C1.include", C1.prototype.include);
    assertUndefined("C1.extend", C1.prototype.extend);

    var c1 = new C1();
    assertEquals("const", c1.aConst);
    assertFunction(c1.aFunction);
    assertEquals("const", c1.aFunction());
    assertUndefined("C1#include", c1.include);
    assertUndefined("C1#extend", c1.extend);
    assertEquals("instance method", c1.method1());
    assertEquals("C1#toString", "included toString", c1.toString());
    assertEquals("C1#valueOf", "included valueOf", c1.valueOf());
  },
  testSelfIncluded: function() {
    var included = 0, module = {
      selfIncluded: function() {
        included++;
      }
    }, C1 = Class.create({
      include: [module]
    });
    assertEquals(1, included);

    var C2 = Class.create({
      include: [C1]
    });
    assertEquals(1, included);

    var C3 = Class.create({
      include: [module, C1, C2]
    });
    assertEquals(2, included);
  },
  testIncludeSuper: function() {
    var C1 = Class.create({
      include: [{
        method1: function() {
        },
        method2: function() {
          return "module";
        }
      }],
      method1: function($super) {
        return $super;
      },
      method2: function($super) {
        return $super() + " included";
      }
    });
    var c1 = new C1();
    assertFunction("$super should point to included method", c1.method1());
    assertEquals("module included", c1.method2());

    var C2 = Class.create(C1, {
      method1: function($super) {
        return $super;
      },
      method2: function($super) {
        return $super() + " inherited";
      }
    });
    var c2 = new C2();
    assertFunction("$super should point to inherited method", c2.method1());
    assertEquals("module included inherited", c2.method2());
  },
  testRuntimeSubclass: function() {
    var C1 = Class.create({
      method1: function() {
        return "C1";
      }
    }), C2 = Class.create(C1, {
      method2: function() {
        return "C2";
      },
      createSubclass: function(module) {
        return Class.create(this.constructor, module);
      }
    });
    var o2 = new C2(), C3 = o2.createSubclass({
      method3: function() {
        return "subclass";
      }
    }), o3 = new C3();
    assertInstanceOf("o2 instanceOf C1", C1, o2);
    assertInstanceOf("o2 instanceOf C2", C2, o2);
    assertInstanceOf("o3 instanceOf C1", C1, o3);
    assertInstanceOf("o3 instanceOf C2", C2, o3);
    assertFunction("o3.method1", o3.method1);
    assertFunction("o3.method2", o3.method2);
    assertFunction("o3.method3", o3.method3);
  }
});
