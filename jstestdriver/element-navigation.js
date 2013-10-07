/*global $, Class, Element, TestCase, assert, assertArray, assertElementId, assertEquals, assertFunction, assertInstanceOf, assertNotNull, assertUndefined, assertNotUndefined, window */
TestCase("element-navigation.js", {
  testPrevious: function() {
    /*:DOC div = <div><div id="id1" class="class1">1</div><div id="id2" class="class2">2</div><div id="id3" class="class3">3</div></div> */
    //var src = $(this.div).down("#id3");
    var src = $(this.div).lastDescendant(), id = "id2";
    assertFunction(src.previous);
    assertUndefined(src.previous(6));
    assertElementId(id, src.previous());
    assertElementId(id, src.previous(0));
    assertElementId(id, src.previous(".class2"));
    assertElementId(id, src.previous(".class2[id]"));
    assertElementId(id, src.previous(".class1,.class2,.class3,.class4"));
    assertElementId(id, src.previous(".class4,.class3,.class2,.class1"));
  },
  testNext: function() {
    /*:DOC div = <div><div id="id1" class="class1">1</div><div id="id2" class="class2">2</div><div id="id3" class="class3">3</div></div> */
    var src = $(this.div).firstDescendant(), id = "id2";
    assertUndefined(src.next(2));
    assertElementId(id, src.next());
    assertElementId(id, src.next(0));
    assertElementId(id, src.next(".class2"));
    assertElementId(id, src.next(".class2[id]"));
    assertElementId(id, src.next(".class1,.class2,.class3,.class4"));
    assertElementId(id, src.next(".class4,.class3,.class2,.class1"));
  },
  testGetFocusableElements: function() {
    /*:DOC div = <div> <a class="focusable">link</a> <input class="focusable" /><input type="text" class="focusable" /><input type="text" disabled="disabled" /><input type="hidden" /> </div> */
    var elements = $(this.div).getFocusableElements();
    assertEquals(3, elements.length);
    for(var i = 0, len = elements.length; i < len; i++) {
      assert(elements[i].hasClassName("focusable"));
    }
  },
  end: ""
});
