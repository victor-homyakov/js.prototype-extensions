/*global Element, Event, Node */
/**
 * Custom events:
 *   focus:in, focus:out,
 *   mouse:wheel
 *   resize:start, resize:continued, resize:end
 */
/**
 * Bubbling focus:in and focus:out events.
 * Usage:
 *   document.on("focus:in", selector, focusHandler); // on focus
 *   document.on("focus:out", selector, blurHandler); // on blur
 *
 * Unified cross-browser mouse:wheel event.
 * Usage:
 *   document.on("mouse:wheel", selector, mouseWheelHandler);
 */
(function() {
  function focusin(event) {
    Event.findElement(event).fire("focus:in");
  }

  function focusout(event) {
    Event.findElement(event).fire("focus:out");
  }

  if (document.addEventListener) {
    document.addEventListener("focus", focusin, true);
    document.addEventListener("blur", focusout, true);
  } else {
    document.observe("focusin", focusin);
    document.observe("focusout", focusout);
  }

  function wheel(event) {
    var delta;
    if (event.wheelDelta) { // IE & Opera
      delta = event.wheelDelta / 120;
    } else if (event.detail) { // W3C
      delta = -event.detail / 3;
    } else {
      return;
    }

    var customEvent = Event.findElement(event).fire("mouse:wheel", {
      delta: delta
    });
    if (customEvent.stopped) {
      Event.stop(event);
      return false;
    }
  }

  document.observe("mousewheel", wheel);
  document.observe("DOMMouseScroll", wheel);
})();


/**
 * Window resizing events: resize:start, resize:continued, resize:end.
 *
 * Event resize:continued will fire with interval >= delayRC milliseconds and
 * only if window size is actually changed (e.g. no repeated events with same window size).
 *
 * Event resize:end will fire once after resize:continued if window dimensions stay unchanged for
 * delayRE milliseconds.
 *
 * Each event will provide actual window dimensions as additional parameter.
 */
/*
 (function() {
 var timerRC = null, timerRE = null, delayRC = 200, delayRE = 500, dimensions = {};

 function fireResizeContinued() {
 var dims = document.viewport.getDimensions();
 if (dims.width !== dimensions.width || dims.height !== dimensions.height) {
 dimensions = dims;
 document.fire("resize:continued", dimensions);
 }
 timerRC = setTimeout(fireResizeContinued, delayRC);
 }

 function fireResizeEnd() {
 clearTimeout(timerRC);
 timerRC = null;
 timerRE = null;
 document.viewport.isResizing = false;
 document.fire("resize:end", document.viewport.getDimensions());
 }

 function resizeListener() {
 //console.log("resizeListener - isResizing", document.viewport.isResizing);
 if (!document.viewport.isResizing) {
 dimensions = document.viewport.getDimensions();
 document.viewport.isResizing = true;
 document.fire("resize:start", dimensions);
 timerRC = setTimeout(fireResizeContinued, delayRC);
 }
 if (timerRE) {
 //console.log("clearTimeout(timerRE)");
 clearTimeout(timerRE);
 }
 timerRE = setTimeout(fireResizeEnd, delayRE);
 }

 Event.observe((document.onresize ? document : window), "resize", resizeListener);
 })();
 */
