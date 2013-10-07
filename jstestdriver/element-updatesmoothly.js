/*global $, AsyncTestCase, assert, expectAsserts */
AsyncTestCase("element-updatesmoothly.js", {
  testUpdateSmoothlyDeferred: function(queue) {
    expectAsserts(5);

    /*:DOC div = <div><table><tbody><tr><td>1</td><td class="class1 class2" style="text-align:right">2</td></tr></tbody></table></div> */
    var div = $(this.div), cell = div.down("td", 1), options = {
      deferred: true
    };
    assert("TD should have both classes", cell.hasClassName("class1") && cell.hasClassName("class2"));

    div.updateSmoothly('<table><tbody><tr><td>1</td><td class="class1" style="text-align:right">2</td></tr></tbody></table>', options);
    cell = div.down("td", 1);
    assert("TD classes should change only after delay", cell.hasClassName("class1") && cell.hasClassName("class2"));

    queue.call("Wait", function(callbacks) {
      setTimeout(callbacks.noop(), 100);
    });

    queue.call("Test", function(callbacks) {
      cell = div.down("td", 1);
      assert("TD should have only one class", cell.hasClassName("class1") && !cell.hasClassName("class2"));

      div.updateSmoothly('<table><tbody><tr><td>1</td><td style="text-align:right">2</td></tr></tbody></table>', options);
      cell = div.down("td", 1);
      assert("TD classes should change only after delay", cell.hasClassName("class1") && !cell.hasClassName("class2"));
    });

    queue.call("Wait", function(callbacks) {
      setTimeout(callbacks.noop(), 100);
    });

    queue.call("Test", function(callbacks) {
      cell = div.down("td", 1);
      assert("TD classes should be removed", !cell.hasClassName("class1") && !cell.hasClassName("class2"));
    });
  }
});
