/*global Class, Control */
window.Control = window.Control || {};

/**
 * Queue.
 */
Control.Queue = Class.create({
  initialise: function() {
    // Create the internal queue
    this.queue = [];
    // The amount of space at the front of the queue, initialised to zero
    this.queueSpace = 0;
  },

  /**
   * Returns the size of this Queue. The size of a Queue is equal to the number
   * of elements that have been enqueued minus the number of elements that have
   * been dequeued.
   */
  getSize: function getSize() {
    return this.queue.length - this.queueSpace;
  },

  /**
   * Returns true if this Queue is empty, and false otherwise. A Queue is empty
   * if the number of elements that have been enqueued equals the number of
   * elements that have been dequeued.
   */
  isEmpty: function isEmpty() {
    return (this.queue.length === 0);
  },

  /**
   * Enqueues the specified element in this Queue.
   *
   * @param element - the element to enqueue
   */
  enqueue: function enqueue(element) {
    this.queue.push(element);
  },

  /**
   * Dequeues an element from this Queue. The oldest element in this Queue is
   * removed and returned. If this Queue is empty then undefined is returned.
   *
   * @returns Object The element that was removed from the queue.
   */
  dequeue: function dequeue() {
    // check whether the queue is empty
    if (this.queue.length) {
      // fetch the oldest element in the queue
      var element = this.queue[this.queueSpace];

      // update the amount of space and check whether a shift should occur
      if (++this.queueSpace * 2 >= this.queue.length) {
        // set the queue equal to the non-empty portion of the queue
        this.queue = this.queue.slice(this.queueSpace);
        // reset the amount of space at the front of the queue
        this.queueSpace = 0;
      }

      // return the removed element
      try {
        return element;
      } finally {
        element = null; // IE 6 leak prevention
      }
    }
  },

  /**
   * Returns the oldest element in this Queue. If this Queue is empty then
   * undefined is returned. This function returns the same value as the dequeue
   * function, but does not remove the returned element from this Queue.
   */
  getOldestElement: function getOldestElement() {
    if (this.queue.length) {
      return this.queue[this.queueSpace];
    }
  }
});
