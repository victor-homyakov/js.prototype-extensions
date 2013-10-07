/*global $, $F, Form, Prototype, window */

/**
 * Save/restore/clear state of form fields.
 *
 * Form has a state if it has an id. Field has a state if it has a name
 * (field should be sent to the server) or id (field is used somewhere in scripts).
 *
 * Requires: prototype-1.7.js, prototype-1.7-ext.js (events-custom.js, prototype.js).
 */
(function() {
  var h5 = Prototype.HTML5Features || {}, storage = h5.LocalStorage ? {
    getKey: function(form) {
      // var href = window.location.hostname + window.location.pathname + window.location.search;
      return "form-state-" + form.id + "-" + window.location.pathname;
    },
    setItem: function(form, string) {
      try {
        window.localStorage.setItem(this.getKey(form), string);
      } catch (e) {
        // QUOTA_EXCEEDED_ERR
      }
    },
    getItem: function(form) {
      return window.localStorage.getItem(this.getKey(form)) || "{}";
    },
    removeItem: function(form) {
      window.localStorage.removeItem(this.getKey(form));
    }
  } : {
    setItem: function() {
    },
    getItem: function() {
      return {};
    },
    removeItem: function() {
    }
  };

  var lastState = "";

  /*function getStatefulFields(form) {
   return form.getElements().findAll(function(f) {
   //return f.type != 'file' && f.type != 'button' && f.type != 'submit' && f.type != 'reset';
   return (f.name || f.id) && !((/^(?:button|submit|reset|file)$/i).test(f.type));
   });
   }
   function getStatefulFields(form) {
   var elements = Form.getElements(form), stateful = [];
   for (var i = 0, len = elements.length; i < len; ++i) {
   var f = elements[i];
   if ((f.name || f.id) && !((/^(?:button|submit|reset|file)$/i).test(f.type))) {
   stateful.push(f);
   }
   }
   return stateful;
   }*/
  function getStatefulFields(form) {
    var elements = $(form).getElementsByTagName('*');
    var element, stateful = [], serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      if ((element.name || element.id) &&
      serializers[element.tagName.toLowerCase()] &&
      !((/^(?:button|submit|reset|file)$/i).test(element.type))) {
        stateful.push(Element.extend(element));
      }
    }
    return stateful;
  }

  function saveState(form) {
    var state = {};
    form = $(form);
    getStatefulFields(form).each(function(f) {
      var value = $F(f);
      if (value) {
        state[f.name || f.id] = value;
      }
    });

    var stateStr = Object.toJSON(state);
    if (lastState !== stateStr) {
      storage.setItem(form, stateStr);
      lastState = stateStr;
      //alert("Saved state\n" + stateStr);
      //console.log("Saved state", state);
    }
    //return state;
    return form;
  }

  function restoreState(form) {
    form = $(form);
    var stateStr = storage.getItem(form), state = stateStr.evalJSON();
    getStatefulFields(form).each(function(f) {
      var value = state[f.name || f.id];
      f.setValue(Object.isUndefined(value) ? "" : value);
    });
    lastState = stateStr;
    //alert("Restored state\n" + stateStr);
    //console.log("Restored state", state);
    //return state;
    return form;
  }

  function clearState(form) {
    form = $(form);
    storage.removeItem(form);
    //alert("Cleared state " + form.id);
    //console.log("Cleared state", form);
    return form;
  }

  Object.extend(Form.Methods, {
    saveState: saveState,
    restoreState: restoreState,
    clearState: clearState
  });
})();
