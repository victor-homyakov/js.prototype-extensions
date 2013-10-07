/*global $, Element, TestCase, assert, assertElementId, assertEquals, assertFunction, window */
TestCase("element.js", {
  testParseIntStyle: function() {
    function parseIntStyle(value) {
      value = parseInt(value || 0, 10);
      return isNaN(value) ? 0 : value;
    }

    assertEquals("undefined should be parsed as 0", 0, parseIntStyle());
    assertEquals("null should be parsed as 0", 0, parseIntStyle(null));
    assertEquals("'auto' should be parsed as 0", 0, parseIntStyle('auto'));
    assertEquals("undefined should be parsed as 0", 0, parseIntStyle(0));
    assertEquals("'0px' should be parsed as 0", 0, parseIntStyle('0px'));
    assertEquals("'10px' should be parsed as 10", 10, parseIntStyle('10px'));
  },
  testMakeClippingUndoClipping: function() {
    var chained = Element.extend(document.createElement('DIV'));
    assertEquals(chained, chained.makeClipping());
    assertEquals(chained, chained.makeClipping());
    assertEquals(chained, chained.makeClipping().makeClipping());

    assertEquals(chained, chained.undoClipping());
    assertEquals(chained, chained.undoClipping());
    assertEquals(chained, chained.undoClipping().makeClipping());
  },
  testMakeClippingOverflowAuto: function() {
    /*:DOC += <div id="element_with_auto_overflow" style="overflow:auto;">A</div> */
    var element = $("element_with_auto_overflow");
    assertEquals(null, element.getStyle('overflow'));
    assertEquals("inline style with overflow:auto", "auto", element.style.overflow);
    element.makeClipping();
    assertEquals('hidden', element.getStyle('overflow'));
    element.undoClipping();
    assertEquals(null, element.getStyle('overflow'));
    assertEquals("restored inline style with overflow:auto", "auto", element.style.overflow);
  },
  testMakeClippingOverflowEmpty: function() {
    /*:DOC += <div id="element_with_empty_overflow" style="display:none;">E</div> */
    var element = $("element_with_empty_overflow");
    assertEquals("visible", element.getStyle('overflow'));
    assertEquals("inline style without overflow", '', element.style.overflow);
    element.makeClipping();
    assertEquals('hidden', element.getStyle('overflow'));
    element.undoClipping();
    assertEquals("visible", element.getStyle('overflow'));
    assertEquals("restored inline style without overflow", '', element.style.overflow);
  },
  testMakeClipping: function() {
    /*:DOC += <div id="element_with_visible_overflow" style="overflow:visible;">V</div> */
    /*:DOC += <div id="element_with_hidden_overflow" style="overflow:hidden;">H</div> */
    /*:DOC += <div id="element_with_scroll_overflow" style="overflow:scroll;">S</div> */
    ['visible', 'hidden', 'scroll'].each(function(overflowValue) {
      var element = $('element_with_' + overflowValue + '_overflow');
      assertEquals(overflowValue, element.getStyle('overflow'));
      element.makeClipping();
      assertEquals('hidden', element.getStyle('overflow'));
      element.undoClipping();
      assertEquals(overflowValue, element.getStyle('overflow'));
    });
  },
  testInsertInto: function() {
    /*:DOC += <div id="testInsertInto"></div> */
    assertFunction(Element.insertInto);
    var e = new Element("div").insertInto(document.body);
    assertEquals(Element.lastDescendant(document.body), e);
    e.remove().insertInto(document.body, "top");
    assertEquals(Element.firstDescendant(document.body), e);
    e.remove().insertInto("testInsertInto", "before");
    assertEquals(Element.previous("testInsertInto"), e);
    e.remove().insertInto("testInsertInto", "after");
    assertEquals(Element.next("testInsertInto"), e);
    e.remove();
  },
  testIsVisible: function() {
    /*:DOC += <style type="text/css">.xdisplay{display:none;} .xvisibility{visibility:hidden;}</style> */
    /*:DOC += <div id="element_visible"></div> */
    /*:DOC += <div id="element_hidden_display" class="xdisplay"></div> */
    /*:DOC += <div id="element_hidden_visibility" class="xvisibility"></div> */
    /*:DOC += <div id="element_hidden_inline_display" style="display:none;"><div id="element_hidden_parent_display"></div></div> */
    /*:DOC += <div id="element_hidden_inline_visibility" style="visibility:hidden;"><div id="element_hidden_parent_visibility"></div></div> */

    assert(!Element.isVisible());
    assert(!Element.isVisible(null));
    assert(!Element.isVisible(undefined));
    assert(!Element.isVisible("non-existent-id"));
    assert(!Element.isVisible(new Element("div")));

    assert("window should be visible", Element.isVisible(window));
    assert("document.body should be visible", Element.isVisible(document.body));
    assert("document.documentElement should be visible", Element.isVisible(document.documentElement));
    assert("injected div#element_visible should be visible", $("element_visible") && Element.isVisible("element_visible") && $("element_visible").isVisible());

    ["display", "visibility", "inline_display", "inline_visibility", "parent_display", "parent_visibility"].each(function(s) {
      var id = "element_hidden_" + s;
      assert(!!$(id) && !Element.isVisible(id));
    });
  },
  testGetOuterHTML: function() {
    /*:DOC div = <div id="id1" class="class1">1</div> */
    var html = $(this.div).getOuterHTML();
    var expected1 = '<div class="class1" id="id1">1</div>', expected2 = '<div id="id1" class="class1">1</div>';
    assert("HTML '" + html + "' should look like '" + expected1 + "'", (html === expected1) || (html === expected2));
    html = Element.getOuterHTML(new Element("br"));
    assert("HTML '" + html + "' should look like '<br>'", ('<br>' === html) || ('<BR>' === html));
  },
  testGetScrollParent: function() {
    /*:DOC += <div id="testGetScrollParent" style="height:1em;overflow:auto;"><table><tr><td id="td1">1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>4</td></tr><tr><td>5</td></tr></table></div> */
    var p = $("testGetScrollParent").getScrollParent();
    assert("div parent is: " + Object.inspect(p), p && (/html|body/i).test(p.tagName));
    p = $("td1").getScrollParent();
    assertElementId("div>table>tr>td parent is: " + Object.inspect(p), "testGetScrollParent", p);
  },
  testUpdateSmoothlyBasic: function() {
    /*:DOC div = <div></div> */
    var div = $(this.div);
    div.updateSmoothly("");
    assertEquals("", div.innerHTML);
    div.updateSmoothly("1");
    assertEquals("1", div.innerHTML);

    div.updateSmoothly("<b>1</b>");
    assertEquals("<b>1</b>", div.innerHTML.toLowerCase());
    assertEquals(1, div.childNodes.length);
  },
  testUpdateSmoothlyAttributesProperties: function() {
    /*:DOC div = <div></div> */
    var div = $(this.div);
    div.updateSmoothly("<b>1</b>");
    assertEquals("<b>1</b>", div.innerHTML.toLowerCase());

    div.down("b").writeAttribute("xxx", "xxx");
    assertEquals("<b xxx=\"xxx\">1</b>", div.innerHTML.toLowerCase());
    div.updateSmoothly("<b><i>2</i></b>");
    //assertEquals("<b xxx=\"xxx\"><i>2</i></b>", div.innerHTML.toLowerCase());
    //assertEquals("xxx", div.down("b").readAttribute("xxx"));
    assertEquals("<b><i>2</i></b>", div.innerHTML.toLowerCase());
    assertEquals(null, div.down("b").readAttribute("xxx"));

    // custom property yyy="yyy" should stay unchanged
    div.down("b").yyy = "yyy";
    assertEquals("yyy", div.down("b").yyy);
    div.updateSmoothly("<b><i>3</i></b>");
    //assertEquals("<b xxx=\"xxx\"><i>3</i></b>", div.innerHTML.toLowerCase());
    assertEquals("<b><i>3</i></b>", div.innerHTML.toLowerCase());
    assertEquals("yyy", div.down("b").yyy);

    div.update('<a href="#a1" title="title1">&nbsp;</a>');
    assertEquals("title1", div.down("a").readAttribute("title"));
    div.updateSmoothly('<a href="#a2" title="title2" class="class2">&nbsp;</a>');
    assertEquals("Title of element should be updated", "title2", div.down("a").readAttribute("title"));
    assertEquals("Class of element should be updated", "class2", div.down("a").readAttribute("class"));
  },
  testUpdateSmoothlyClasses: function() {
    /*:DOC div = <div></div> */
    var div = $(this.div);

    //div.update('<div class="class1 class2"></div>');
    var e = div.update('<div class="class1 class2"></div>').down();
    assert("DIV should have both classes, but has " + e.className, e.hasClassName("class1") && e.hasClassName("class2"));
    //div.updateSmoothly('<div class="class1"></div>');
    e = div.updateSmoothly('<div class="class1"></div>').down();
    assert("DIV should have only one class, but has " + e.className, e.hasClassName("class1") && !e.hasClassName("class2"));
    //div.updateSmoothly('<div></div>');
    e = div.updateSmoothly('<div></div>').down();
    assert("DIV should have no classes, but has " + e.className, !e.hasClassName("class1") && !e.hasClassName("class2"));

    div.update('<table><tbody><tr><td>1</td><td class="class1 class2" style="text-align:right">2</td></tr></tbody></table>');
    var cell = div.down("td", 1);
    assert("TD should have both classes", cell.hasClassName("class1") && cell.hasClassName("class2"));
    div.updateSmoothly('<table><tbody><tr><td>1</td><td class="class1" style="text-align:right">2</td></tr></tbody></table>');
    cell = div.down("td", 1);
    assert("TD should have only one class", cell.hasClassName("class1") && !cell.hasClassName("class2"));
    div.updateSmoothly('<table><tbody><tr><td>1</td><td style="text-align:right">2</td></tr></tbody></table>');
    cell = div.down("td", 1);
    assert("TD classes should be removed", !cell.hasClassName("class1") && !cell.hasClassName("class2"));
  },
  testUpdateSmoothlyDiff: function() {
    /*:DOC div = <div></div> */
    var div = $(this.div);
    div.update('<span id="span1">1</span><span id="span2">2</span><span id="span3">3</span>');
    div.updateSmoothly('<span id="span1">1</span><span id="span3">3</span>');
    assert(div.down("span", 1).id === "span3");
    div.updateSmoothly('<span id="span1">1</span><span id="span2">2</span><span id="span3">3</span>');
    assert(div.down("span", 1).id === "span2");
  },
  testUpdateSmoothlyDeferred: function() {
    /*:DOC div = <div></div> */
    var div = $(this.div), options = {
      deferred: true
    };
    // TODO
  },
  end: ""
});
