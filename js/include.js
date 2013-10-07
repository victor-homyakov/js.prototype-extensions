/*global $$, Element, Prototype */
/**
 * Dynamic loading of CSS and JavaScript files.
 *
 * Examples:
 * var css = Include("css/style.css");
 * Element.remove(css);
 * Include("js/controls.js", callback);
 * var js = Include.js("dyna.php");
 * if(Include.findcss("css/style.css")) alert("CSS is already loaded");
 * if(Include.findjs("js/controls.js")) alert("JS is already loaded");
 *
 * @param {String} url - file URL
 * @param {Function} onload - onload callback for JavaScript
 */
var Include = function(url, onload) {
  if (url.endsWith(".css")) {
    return Include.css(url);
  } else if (url.endsWith(".js")) {
    return Include.js(url, onload);
  } else {
    throw new Error("Unknown file extension in URL '" + url + "'. Only .css and .js are recognized automatically. Either add known extension or call Include.css(cssUrl)/Include.js(jsUrl) explicitly.");
  }
};

Object.extend(Include, {
  head: function() {
    return document.head || document.getElementsByTagName("head")[0];
    // head = head || document.documentElement;
  },
  isCssText: function(css) {
    return (/[\s\S]+\{[\s\S]+\:[\s\S]+\}/).test(css);
  },
  css: function(content, media) {
    return this.isCssText(content) ? this.cssText(content) : this.cssUrl(content, media);
  },
  /**
   * Creates a link to the style sheet and adds it to the document.
   *
   * @param {String} url - the URL of CSS
   * @param {String} media - CSS media (optional, default "all")
   * @return {Element} the LINK element
   */
  cssUrl: function(url, media) {
    // TODO check if CSS is not found on server (404 Not Found)
    var css = this.findcss(url);
    if (!css) {
      media = media || "all";
      css = new Element("link", {
        rel: "stylesheet",
        type: "text/css",
        media: media,
        href: url
      });
      /*css = document.createElement("link");
       css.setAttribute("rel", "stylesheet");
       css.setAttribute("type", "text/css");
       css.setAttribute("media", media);
       css.setAttribute("href", url);*/
      this.head().appendChild(css);
    }
    return css;
  },
  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   *
   * @param {String} text - the CSS text
   * @return {Element} the STYLE element
   */
  cssText: function(text) {
    var p = document.createElement("p");
    p.innerHTML = 'x<style type="text/css">' + text + '<\/style>';
    return this.head().appendChild(p.lastChild);
    /*
     var css = new Element("style", {
     type: "text/css"
     });
     //var css = document.createElement("style");
     //css.type = "text/css"; // css.setAttribute("type", "text/css");
     if (css.styleSheet) { // IE
     css.styleSheet.cssText = text;
     } else { // W3C
     css.appendChild(document.createTextNode(text));
     }
     this.head().appendChild(css);
     return css;
     */
  },
  js: function(url, onload) {
    var js = this.findjs(url);
    if (js) {
      if (onload) {
        onload();
      }
    } else {
      js = new Element("script", {
        type: "text/javascript",
        src: url
      });
      //js = document.createElement("script");
      //js.setAttribute("type", "text/javascript");
      //js.setAttribute("src", url);
      if (onload) {
        js.onload = onload;
        if (Prototype.Browser.IE) {
          js.onreadystatechange = function onreadystatechange() { // this === js
            var rs = this.readyState; // js.readyState
            if (rs === "complete" || rs === "loaded") {
              // cleanup
              this.onload = this.onreadystatechange = null;
              //alert("Ready state: " + rs);
              onload();
            }
          };
        }
      }
      this.head().appendChild(js);
    }
    return js;
  },
  findcss: function(url) {
    return $$('link[href="' + url + '"]')[0];
  },
  findjs: function(url) {
    return $$('script[src="' + url + '"]')[0];
  }
});
//  if (head) {
//    var script = document.createElement("script");
//    script.type = "text/javascript";
//    script.src = "script.js";
//    script.setAttribute('charset', 'utf8');
//    head.appendChild(script);
//    document.body.appendChild(script);
//  }
