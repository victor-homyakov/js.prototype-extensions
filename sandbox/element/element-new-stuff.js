var GetUtils = {
  innerText: function(element) {
    if (document.getElementsByTagName("body")[0].innerText != undefined) {
      return $(element).textContent;
    } else {
      return $(element).innerText;
    }
  }
};
//var x = elem.textContent || elem.innerText;
// .textContent ||.innerText order does matter in modern browsers
// IE doesn't care, so put textContent first always
Element.addMethods(GetUtils);

//////////

/**
 * @return {Boolean} true if element is not in document hierarchy
 * @param {Element} element
 */
function isDetached(element) {
  element = $(element);
  return element !== document.body && !Element.descendantOf(element, document.body);
}

var internalGetStyle = Prototype.Browser.IE ? (function getStyleIE(element, style) {
  var value = element.style[style];
  if (!value && element.currentStyle) {
    value = element.currentStyle[style];
  }
  return value == 'auto' ? null : value;
}) : (function getStyleDOM(element, style) {
  var value = element.style[style];
  if (!value || value == 'auto') {
    var css = document.defaultView.getComputedStyle(element, null);
    value = css ? css[style] : null;
  }
  return value == 'auto' ? null : value;
});

// infinite scroll:
//if (e.clientHeight + childHeight >= e.scrollHeight - e.scrollTop) {}
//if (e.scrollTop >= e.scrollHeight - (e.clientHeight + childHeight)) {}
// e = child.scrollParent


(function() {
  // TODO document.getElementById('id').classList.add('class');
  // TODO document.getElementById('id').classList.remove('class');
  Element.Methods.hasClassName = Element.Methods.hasClassName.wrap(function(proceed, element, className) {
    if (!(element = $(element))) {
      return;
    }
    var elementClassList = element.classList;
    // Array.prototype.indexOf.call(element.classList, className)
    // Array.prototype.include.call(element.classList, className)
    if (elementClassList && elementClassList.length > 0 && Array.slice(elementClassList).indexOf(className) != -1) {
      return true;
    }
    return proceed(element, className);
  });

  //Element.Methods.removeClassName = Element.Methods.removeClassName.wrap();

  Element.Methods.addClassName = function addClassName(element, className) {
    if (!(element = $(element))) {
      return;
    }
    var elementClassName = element.className;

    if (elementClassName.length === 0) {
      element.className = className;
    } else if ((elementClassName !== className) &&
    (" " + elementClassName + " ").replace((/[\n\t]/g), " ").indexOf(" " + className + " ") == -1) {
      element.className += ' ' + className;
    }

    return element;
  };
})();


/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2012-11-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if (typeof document !== "undefined" && !("classList" in document.documentElement)) {

(function (view) {

"use strict";

if (!('HTMLElement' in view) && !('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.className)
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.className = this.toString();
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, forse) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			forse !== true && "remove"
		:
			forse !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return !result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}
