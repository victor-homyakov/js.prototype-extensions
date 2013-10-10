/*global Element */
Element.Offsets = (function() {

  function updateOffset(e, offset, view) {
    var l = e.offsetLeft, t = e.offsetTop;
    if (l || t) {
      // FIXME use e.measure() for borders
      var style = view.getComputedStyle(e, "");
      if (l) {
        offset.left += l + parseInt(style.borderLeftWidth, 10);
      }
      if (t) {
        offset.top += t + parseInt(style.borderTopWidth, 10);
      }
    }
    return offset;
  }

  function addOffset(e, offset, view) {
    var p = e.offsetParent;
    if (p) {
      if (p.nodeType == 1) {
        offset = updateOffset(e, offset, view);
        addOffset(p, offset, view);
      }
    } else {
      var ownerView = e.ownerDocument.defaultView;
      if (ownerView.frameElement) {
        offset = updateOffset(e, offset, view);
        addOffset(ownerView.frameElement, offset, ownerView);
      }
    }
  }

  function getClientOffset(e) {
    var offset = {
      left: 0,
      top: 0
    };
    if (e) {
      addOffset(e, offset, e.ownerDocument.defaultView);
    }
    return offset;
  }

  function getOverflowParent(element) {
    for (var parent = element.parentNode; parent; parent = parent.offsetParent) {
      if (parent.scrollHeight > parent.offsetHeight) {
        return parent;
      }
    }
  }

  function getScrollParent(element) {
    // maybe use element = getOffsetParent ?
    while ((element = element.parentNode) && element != document.body) {
      var o = Element.getStyle(element, 'overflow');
      if (!o || o == 'scroll') {
        return element;
      }
    }
    return document.body;
  }

  return {
    getClientOffset: getClientOffset,
    getOverflowParent: getOverflowParent,
    getScrollParent: getScrollParent,

    scrollIntoCenterView: function(element, scrollBox, notX, notY) {
      if (!element) {
        return;
      }
      scrollBox = scrollBox || getOverflowParent(element);
      if (!scrollBox) {
        return;
      }
      var offset = getClientOffset(element); // == cumulativeOffset() ?
      if (!notY) {
        var topSpace = offset.top - scrollBox.scrollTop;
        var bottomSpace = (scrollBox.scrollTop + scrollBox.clientHeight) - (offset.top + element.offsetHeight);
        if (topSpace < 0 || bottomSpace < 0) {
          scrollBox.scrollTop = offset.top - (scrollBox.clientHeight / 2);
        }
      }
      if (!notX) {
        var leftSpace = offset.left - scrollBox.scrollLeft;
        var rightSpace = (scrollBox.scrollLeft + scrollBox.clientWidth) - (offset.left + element.clientWidth);
        if (leftSpace < 0 || rightSpace < 0) {
          scrollBox.scrollLeft = offset.left - (scrollBox.clientWidth / 2);
        }
      }
    }
  };
})();
