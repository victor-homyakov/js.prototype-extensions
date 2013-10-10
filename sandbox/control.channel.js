/*global Class, Control */
window.Control = window.Control || {};

/**
 * Channel management.
 *
 * Ajax requests are organized in channels. A channel maintains the order of requests and
 * determines, what should happen when a request is fired while another one is being processed. The
 * default behavior (stack) puts the all subsequent requests in a queue, while the drop behavior
 * limits queue size to one, so only the most recent of subsequent requests is executed. The name of
 * channel determines the policy. E.g. channel with name "foo|s" is a stack channel, while "bar|d"
 * is a drop channel.
 *
 * The Channel class is supposed to be used through the Channel.Manager.
 */
Control.Channel = Class.create({
  initialize: function(/* String */name) {
    //var res = name.match(/^([^|]+)\|(d|s)$/);
    // default to stack
    //this.type = res ? res[2] : 's';
    this.type = name.slice(-2) === '|d' ? 'd' : 's';
    this.callbacks = [];
    this.busy = false;
  },

  schedule: function(callback) {
    if (this.busy) {
      console.info("Channel busy - postponing...");
      if (this.type == 's') { // stack
        this.callbacks.push(callback);
      } else { // drop
        this.callbacks[0] = callback;
      }
    } else {
      this.busy = true;
      try {
        callback();
      } catch (exception) {
        this.busy = false;
        console.error("An error occurred while executing request:" + exception);
      }
    }
  },

  done: function() {
    var c = this.callbacks.shift();
    //var c = (this.callbacks.length > 0) ? this.callbacks.shift() : null;
    if (c) {
      console.info("Calling postponed function...");
      // we can't call the callback from this call-stack
      // therefore we set it on timer event
      //window.setTimeout(c, 1);
      c.defer();
    } else {
      this.busy = false;
    }
  }
});

/**
 * Channel manager maintains a map of channels.
 */
Control.Channel.Manager = Class.create({
  initialize: function() {
    this.channels = {};
  },

  /**
   * Schedules the callback to channel with given name.
   */
  schedule: function(channel, callback) {
    var c = this.channels[channel];
    if (!c) {
      c = new Control.Channel(channel);
      this.channels[channel] = c;
    }
    c.schedule(callback);
  },

  /**
   * Tells the Channel.Manager that the current callback in channel with given name has finished
   * processing and another scheduled callback can be executed (if any).
   */
  done: function(channel) {
    var c = this.channels[channel];
    if (c) {
      c.done();
    }
  }
});
