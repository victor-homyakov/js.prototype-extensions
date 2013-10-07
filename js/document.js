//function getDocumentSelection() {
//  var t = '';
//  if (window.getSelection) {
//    t = window.getSelection();
//  } else if (document.getSelection) {
//    t = document.getSelection();
//  } else if (document.selection) {
//    t = document.selection.createRange().text;
//  }
//  return t;
//}
//
//function selectElement(id) {
//  var range;
//  if (document.selection) {
//    range = document.body.createTextRange();
//    range.moveToElementText(document.all[id]);
//    range.select();
//  } else if (window.getSelection) {
//    range = document.createRange();
//    range.selectNodeContents(document.getElementById(id));
//    var selection = window.getSelection();
//    selection.removeAllRanges();
//    selection.addRange(range);
//  }
//}

/**
 * Clear text selection, if any. Useful while dragging or shift-clicking.
 */
document.clearSelection = function() {
  var selection = window.getSelection ? window.getSelection() : document.selection;
  if (selection) {
    if (selection.empty) {
      selection.empty();
    }
    if (selection.removeAllRanges) {
      selection.removeAllRanges();
    }
  }
};
