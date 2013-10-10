/**
 * Evaluate JavaScript code in a global context.
 * @param src JavaScript code to evaluate
 */
function globalEval(src) {
  if (window.execScript) {
    window.execScript(src);
    return;
  }
  // We have to wrap the call in an anon function because of a firefox bug, where this is incorrectly set
  // We need to explicitly call window.eval because of a Chrome peculiarity
  var fn = function() {
    window.eval.call(window, src);
  };
  fn();
}

/**
 * Get all scripts from supplied string, return them as an array for later processing.
 * @param str
 * @returns {Array} of script text
 */
function stripScripts(str) {
  // Regex to find all scripts in a string
  var findscripts = /<script[^>]*>([\S\s]*?)<\/script>/igm;
  // Regex to find one script, to isolate it's content [2] and attributes [1]
  var findscript = /<script([^>]*)>([\S\s]*?)<\/script>/im;
  // Regex to remove leading cruft
  var stripStart = /^\s*(<!--)*\s*(\/\/)*\s*(\/\*)*\s*(<!\[CDATA\[)*/;
  // Regex to find src attribute
  var findsrc = /src="([\S]*?)"/im;
  var scripts = [];
  var initialnodes = str.match(findscripts);
  while (!!initialnodes && initialnodes.length > 0) {
    var scriptStr = [];
    scriptStr = initialnodes.shift().match(findscript);
    var src = [];
    // check if src specified
    src = scriptStr[1].match(findsrc);
    var script;
    if (!!src && src[1]) {
      // if this is a file, load it
      var url = src[1];
      // if this is another copy of jsf.js, don't load it
      // it's never necessary, and can make debugging difficult
      if (/\/javax.faces.resource\/jsf.js\?ln=javax\.faces/.test(url)) {
        script = false;
      } else {
        script = loadScript(url);
      }
    } else if (!!scriptStr && scriptStr[2]) {
      // else get content of tag, without leading CDATA and such
      script = scriptStr[2].replace(stripStart, "");
    } else {
      script = false;
    }
    if (!!script) {
      scripts.push(script);
    }
  }
  return scripts;
}

/**
 * Load a script via a url, use synchronous XHR request. This is liable to be slow,
 * but it's probably the only correct way.
 * @param url the url to load
 */
function loadScript(url) {
  var xhr = Ajax.getTransport();
  if (xhr === null) {
    return "";
  }

  xhr.open("GET", url, false);
  xhr.setRequestHeader("Content-Type", "application/x-javascript");
  xhr.send(null);

  // PENDING graceful error handling
  if (xhr.readyState == 4 && xhr.status == 200) {
    return xhr.responseText;
  }

  return "";
}

/**
 * Run an array of scripts text
 * @param scripts array of script nodes
 */
function runScripts(scripts) {
  if (!scripts || scripts.length === 0) {
    return;
  }

  var head = document.getElementsByTagName('head')[0] || document.documentElement;
  while (scripts.length) {
    // create script node
    var scriptNode = document.createElement('script');
    scriptNode.type = 'text/javascript';
    scriptNode.text = scripts.shift(); // add the code to the script node
    head.appendChild(scriptNode); // add it to the page
    head.removeChild(scriptNode); // then remove it
  }
}
