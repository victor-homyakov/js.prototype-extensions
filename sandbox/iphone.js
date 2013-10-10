// updateOrientation checks the current orientation, sets the body's class attribute to portrait,
function updateOrientation() {
  switch (window.orientation) {
    // If we're horizontal
  case 90:
  case -90:
    // Set orient to landscape
    document.body.setAttribute("orientation", "landscape");
    break;

    // If we're vertical
  default:
    // Set orient to portrait
    document.body.setAttribute("orientation", "portrait");
    break;
  }
}

// Hide the annoying load bar
function hideURLBar() {
  setTimeout(function() {
    window.scrollTo(0, 1);
  }, 0);
}

// Sniff for orientation property
if (typeof window.orientation !== "undefined") {
  // Remove scroll class on orientation change
  window.addEventListener("orientationchange", function() {
    Element.removeClassName(document.body, "scrolled");
  }, false);

  // Hide pesky URL bar
  hideURLBar();
  window.addEventListener("orientationchange", hideURLBar, false);

  // Point to the updateOrientation function when iPhone switches between portrait and landscape modes
  updateOrientation();
  window.addEventListener("orientationchange", updateOrientation, false);
}
