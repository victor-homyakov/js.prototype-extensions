/*global $$, Ajax, Element, Event */
(function() {
  document.on('ajax:create', 'form', function(event, form) {
    if (form == event.findElement()) {
      disableFormElements(form);
    }
  });

  document.on('ajax:complete', 'form', function(event, form) {
    if (form == event.findElement()) {
      enableFormElements(form);
    }
  });
})();
