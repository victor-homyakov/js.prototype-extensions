/*global $, Form */

/**
 * Extensions for Form: submit, disable buttons, deserialize.
 */
Object.extend(Form.Methods, {
  /**
   * Form#disableButtons(@form, selector) -> Form
   * Disable all buttons (to prevent accidental submission).
   *
   * @param {Form} form
   * @param {String} selector - optional selector for elements to be disabled
   */
  disableButtons: function(form, selector) {
    form = $(form);
    selector = selector || "input[type=button],input[type=reset],input[type=submit],button";
    //form.select(selector).invoke("disable");
    form.select(selector).each(function(f) {
      f.store("original-disabled", f.disabled).disabled = true;
    });
    return form;
  },
  /**
   * Form#restoreDisabledButtons(@form, selector) -> Form
   * Restore original state of buttons after Form#disableButtons.
   *
   * @param {Form} form
   * @param {String} selector - optional selector for elements to be restored
   */
  restoreDisabledButtons: function(form, selector) {
    form = $(form);
    selector = selector || "input[type=button],input[type=reset],input[type=submit],button";
    form.select(selector).each(function(f) {
      f.disabled = !!f.retrieve("original-disabled");
    });
    return form;
  },

  /**
   * Form#deserialize(@form, source) -> Form
   * Fill form with values of a given object or query string.
   * Each property name of `source` is compared to name attribute of a form element.
   *
   * Examples:
   *   $("form").deserialize("name1=value1&name2=value2");
   *   $("form").deserialize(Object.fromJSON('\u007B"name1":"value1","name2":"value2"}'));
   *
   * @param {Form} form - form element to fill with values
   * @param {Object/String} source - source object where field values are taken from
   *   (may be object or query string)
   */
  deserialize: function(form, source) {
    if (!(form = $(form))) {
      throw new Error("HTMLElement is required");
    }
    //source = Object.isString(source) ? (source.isJSON() ? Object.fromJSON(source) : source.toQueryParams()) : source;
    source = Object.isString(source) ? source.toQueryParams() : source;
    form.getElements().each(function(element) {
      var name = element.name; // element.name element.readAttribute("name") element.getAttribute("name")
      if (name && !Object.isUndefined(source[name])) { // && name in source
        element.setValue(source[name]);
      }
    });
    return form;
  }
});


/**
 * Extensions for Field (Form.Element): clear, setDisabled.
 */
Object.extend(Form.Element.Methods, {
  /**
   * Override default clear method.
   *
   * Examples:
   *   $("form").getElements().invoke("clear");
   *
   * @param {Field|HTMLInputElement|HTMLSelectElement|HTMLButtonElement} element - field to clear
   */
  clear: function(element) {
    element = $(element);
    var t = element.type, tag = element.tagName.toLowerCase();
    // if (t == "text" || t == "password" || t == "hidden" || tag == "textarea")
    /*if ((/^(?:text|password|hidden)$/i).test(t) || tag == "textarea") {
     element.value = "";
     } else*/
    if (t === "checkbox" || t === "radio") {
      element.checked = false;
    } else if (tag === "select") {
      element.selectedIndex = -1;
    } else if ((/^(?:button|image|reset|submit)$/i).test(t) || tag === "button") {
      // do nothing
    } else {
      // default for all other fields
      element.value = "";
    }
    return element;
  },
  /**
   * Disable/enable field.
   *
   * @param {Field|HTMLInputElement|HTMLSelectElement|HTMLButtonElement} element
   * @param {Boolean} disabled
   */
  setDisabled: function(element, disabled) {
    element = $(element);
    element.disabled = !!disabled;
    return element;
  }
});

/**
 * Fix textarea line breaks.
 * For line break $(textarea).value returns \r\n in IE and Opera, \n in other browsers.
 * Field.getValue(textarea) will always return \r\n.
 */
(function() {
  var TEXTAREA = document.createElement("textarea");
  TEXTAREA.value = '\n';
  if (TEXTAREA.value !== '\r\n') {
    //alert("Fix textarea \\r\\n line breaks");
    Form.Element.Serializers.textarea = function(element, value) {
      if (Object.isUndefined(value)) {
        return element.value.replace(/\r?\n/g, '\r\n');
      } else {
        element.value = value;
      }
    };
  }
  TEXTAREA = null;
})();


document.on("click", "form input[type=image]", function(event, image) {
  var name = image.name, form = event.findElement("form"), data = false;
  if (name) {
    var offset = image.cumulativeOffset();
    data = {};
    data[name + ".x"] = Math.round(event.pageX - offset.left);
    data[name + ".y"] = Math.round(event.pageY - offset.top);
    //alert(Object.toJSON(data));
  }
  form.store("form:submit-button", data);
});

/**
 * Register the name and value of pressed submit button.
 *
 * @param {Event} event
 * @param {Element} submit button
 */
document.on("click", "form input[type=submit], form button[type=submit], form button:not([type])", function(event, button) {
  var name = button.name, form = event.findElement("form"), data = false;
  if (name) {
    data = {};
    data[name] = button.value;
  }
  form.store("form:submit-button", data);
});
