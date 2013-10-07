/*global Audio, Prototype */
Prototype.HTML5Features = (function() {
  var n = navigator, w = window, SessionStorage = false; // d = document, e;
  try {
    SessionStorage = !!w.sessionStorage;
  } catch (e) {
    // "Operation is not supported" code: "9"
    // nsresult: "0x80530009 (NS_ERROR_DOM_NOT_SUPPORTED_ERR)"
    // in Firefox 3.6 for local file
  }

  return {
    ApplicationCache: !!w.applicationCache,
    //Audio: !!(e = d.createElement("audio") && e.canPlayType),
    Audio: !!window.Audio && new Audio().canPlayType,
    //Canvas: !!(e = d.createElement("canvas") && e.getContext && e.getContext("2d")),
    GeoLocation: !!n.geolocation,
    History: !!(w.history && history.pushState),
    LocalStorage: !!w.localStorage,
    OpenDatabase: !!w.openDatabase,
    PostMessage: !!w.postMessage,
    SessionStorage: SessionStorage,
    Touch: !!w.ontouchstart,
    Worker: !!w.Worker
  };
})();

/**
 * Extension for Prototype.Browser: IE6 sniffing.
 */
if (Object.isUndefined(Prototype.Browser.IE6)) {
  // IE7+ may return "MSIE 6.0" but will have XMLHttpRequest
  Prototype.Browser.IE6 = (navigator.appName.indexOf("Microsoft Internet Explorer") != -1 && navigator.appVersion.indexOf("MSIE 6.0") != -1 && !window.XMLHttpRequest);
  //Prototype.Browser.IE = /*@cc_on!@*/false;
  //Prototype.Browser.IE6 = false /*@cc_on || @_jscript_version < 5.7 @*/;
  //Prototype.Browser.IE7 = false /*@cc_on || @_jscript_version == 5.7 @*/;
  //Prototype.Browser.IEgte7 = false /*@cc_on || @_jscript_version >= 5.7 @*/;
}

if (Prototype.Browser.IE6) {
  try {
    document.execCommand("BackgroundImageCache", false, true);
  } catch (e) {
    // ignore
  }
}
