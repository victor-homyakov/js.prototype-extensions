DelayedLoop.forEach = function(collection, callback, delay, completedCallback) {
  collection = $A(collection);
  delay = delay || 10;
  var index = 0;

  function iterator() {
    // Executes the callback, and gets the returned value to indicate what the next delay will be.
    index++;
    var newInterval = callback(collection[index], index);

    if (newInterval === false) {
      // If they returned false, quit looping.
      return;
    }

    if (index < collection.length) {
      // If there are more elements to iterate, re-set delayed loop.
      setTimeout(iterator, typeof newInterval == "number" ? newInterval : delay);
    } else if ( typeof completedCallback == "function") {
      // Otherwise, call the "completed" callback.
      completedCallback();
    }
  }

  // First iteration.
  iterator();
};
