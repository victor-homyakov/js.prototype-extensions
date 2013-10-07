/*global Element, Modalbox, console */

/**
 * Simple JavaScript profiler.
 *
 * Example 1. Profile piece of code:
 * Profiler.begin('some name');
 * // your code here
 * Profiler.end('some name');
 *
 * Example 2. Profile two functions:
 * function x()
 *   Profiler.begin('x');
 *   // your code here
 *   Profiler.end('x');
 * // end of x
 *
 * function y()
 *   Profiler.begin('y');
 *   // your code here
 *   x();
 *   Profiler.end('y','x'); // counts overall time of y and self time of y (y-x)
 * // end of y
 *
 * Example 3. Profile all methods of object:
 * var foo = new Bar();
 * Profiler.attachTo(foo);
 *
 * To see the result, use this bookmarklet:
 * javascript:Profiler.showTimings();
 *
 * To see the result from JavaScript:
 * Profiler.showTimings(document.getElementById('results'));
 * (element with id 'results' should already exist)
 */
var Profiler = {
  header: "<tr><th style='text-align:left;'>name<\/th><th>count<\/th><th>self %<\/th><th>overall time<\/th><th>self time<\/th><th>average overall<\/th><th>average self<\/th><\/tr>",
  /**
   * Execution statistics: hash of (name:begin time).
   */
  tb: {},
  /**
   * Execution statistics: hash of (name:[count, all time, self time]).
   */
  stats: {},

  /**
   * Start recording time for given name.
   *
   * @param {String} name
   */
  begin: function(name) {
    this.tb[name] = (new Date()).getTime();
  },
  /**
   * Stop recording time for given name. Update stats.
   * Additional arguments - names to exclude their times from stats.
   *
   * @param {String} name - name for stats
   * @param {String} excludedname,... - names to exclude their times from stats
   */
  end: function(name) {
    var tover = (new Date()).getTime() - this.tb[name], exclude, exstat, texcluded = 0, i, len;
    for (i = 1, len = arguments.length; i < len; ++i) {
      exclude = arguments[i];
      if (exclude) {
        exstat = this.stats[exclude] || [0, 0, 0];
        texcluded += exstat[1];
        //console.log("exclude", exclude, exstat, texcluded);
      }
    }
    //console.log("end", name, this.tb[name], tover, texcluded);
    this.updateStats(name, 1, tover, texcluded);
  },
  /**
   * Update stats for given name.
   *
   * @param {String} name
   * @param {Number} count - execution count
   * @param {Number} tover - execution time for last call
   * @param {Number} texcluded - overall excluded time (for all calls)
   */
  updateStats: function(name, count, tover, texcluded) {
    var stat = this.stats[name] || [0, 0, 0];
    this.stats[name] = [stat[0] + count, stat[1] + tover, stat[2] + tover - texcluded];
  },
  /**
   * Automatically attach to all functions of given object.
   *
   * @param {Object} o - object to attach to
   */
  attachTo: function(o) {
    var slice = Array.prototype.slice, count = 0;
    function attach(obj, name) {
      count++;
      obj[name]._profiler_name = name;
      obj[name] = obj[name].wrap(function(proceed) {
        //console.log(name, arguments.callee.caller.caller._profiler_name);
        var args = slice.call(arguments, 1), caller = arguments.callee.caller.caller;
        caller = caller ? caller._profiler_name : null;
        var result, time, begin = new Date();
        result = proceed.apply(o, args);
        time = new Date() - begin;
        //console.log(name, "time:", time, "Caller:", caller);
        Profiler.updateStats(name, 1, time, 0);
        if (caller) {
          Profiler.updateStats(caller, 0, 0, time);
        }
        return result;
      });
    }
    for (var f in o) {
      if (Object.isFunction(o[f])) {
        attach(o, f);
      }
    }
    try {
      console.log("Profiler:", count, "methods of", o, "transformed");
    } catch (e) {
    }
  },
  clearTimings: function() {
    this.tb = {};
    this.stats = {};
  },
  /**
   * Show table (ready for TableKit) with profiler timings.
   * If element is specified, will insert table with timings into that element.
   * Otherwise will open table in Modalbox (if available) or in new window.
   *
   * @param {Element} e - HTML element to insert table into (optional)
   */
  showTimings: function(e) {
    var s = this.header, name, t, allTime = 0, selfTime = 0;
    for (name in this.stats) {
      t = this.stats[name];
      allTime += t[1];
      selfTime += t[2];
    }
    for (name in this.stats) {
      t = this.stats[name];
      s += "<tr><td style='text-align:left;'>" + name + "<\/td><td>" + t[0] + "<\/td><td>" + (t[2] * 100 / selfTime).toFixed(2) + "%<\/td><td>" + t[1] + "<\/td><td>" + t[2] + "<\/td><td>" + (t[1] / t[0]).toFixed(2) + "<\/td><td>" + (t[2] / t[0]).toFixed(2) + "<\/td><\/tr>";
    }
    s = "<table class='sortable' summary='Profiler timings' style='text-align:right;'>" + s + "<\/table>";

    if (e) {
      Element.update(e, s);
    } else if (window.Modalbox) {
      Modalbox.show(s, {
        transitions: false,
        width: 900
      });
    } else {
      var w = window.open("", "_blank");
      w.document.write(s);
      w.document.close();
    }
  }
};
