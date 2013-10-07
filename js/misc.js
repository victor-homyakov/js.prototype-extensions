/*global $A */
/**
 * Extensions for Math, Number: constrain, random.
 */
(function() {
  // TODO consider using `clamp` instead of `constrain`
  /**
   * Constrain number. Order of min and max arguments does not matter. Usage:
   *   Math.constrain(x, 0, 100) // return 0 if x<0, 100 if x>100, x otherwise
   *   Math.constrain(x, 100, 0) // the same
   *   x.constrain(xmin, xmax)
   *
   * @param {Number} number
   * @param {Number} min - minimum bound
   * @param {Number} max - maximum bound
   * @return number between minimum and maximum bound (both inclusive)
   */
  function constrain(number, min, max) {
    return min > max ? constrain(number, max, min) : number > max ? max : number < min ? min : parseFloat(number);
  }


  Math.constrain = constrain;
  Number.prototype.constrain = function(min, max) {
    //return min > max ? constrain(this, max, min) : this > max ? max : this < min ? min : parseFloat(this);
    return constrain(this, min, max);
  };

  var original_random = Math.random;
  /**
   * Extended random number generator. Usage:
   *   Math.random() // same as original random, return float between 0 and 1
   *   Math.random(100) // return integer between 0 and 100 (both inclusive)
   *   Math.random(1, 12) // return integer between 1 and 12 (both inclusive)
   *
   * @param {Number} min - minimum value (2 arguments) or maximum value (1 argument)
   * @param {Number} max - maximum value (2 arguments)
   * @return float [0, 1) for no args, integer [0, min] for 1 arg, integer [min, max] for 2 args
   */
  Math.random = function(min, max) {
    var l = arguments.length, r = original_random();
    return l === 0 ? r : ~~(l === 1 ? (r * (min + 1)) : (r * (max - min + 1) + ~~min));
  };
})();

/**
 * Convert number to pixel value. Convert negative numbers to 0px.
 *
 * @param {Number} number
 */
Number.toPx = function(number) {
  return number > 0 ? (number + "px") : "0px";
  //return (number > 0 ? number : 0) + "px";
};
Number.prototype.toPx = function() {
  return Number.toPx(this);
};


/**
 * Correct null and undefined values.
 *
 * @param {Object} value
 * @param {String} [fix=""] - default value for null or undefined
 */
String.interpret = function(value, fix) {
  return value == null ? fix || "" : (typeof (value) == "string" ? value : "" + value);
};

/**
 * Capitalizes the first letter of a string.
 */
String.prototype.capitalize1st = function() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};


/**
 * Checks whether this is a leap year or not.
 *
 * @param {Number} year
 * @return {Boolean} true if this is a leap year
 */
Date.isLeapYear = function(year) {
  //(year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};


/**
 * Simplify usage of generic slice on array-like objects.
 *
 * @param {Array|Arguments|NodeList} array - array-like object (usually Arguments or NodeList)
 * @param {Number} [begin=0] - start index (inclusive)
 * @param {Number} [end=array.length] - end index (exclusive)
 * @return {Array} Array which contains items of original object
 */
Array.slice = function(array, begin, end) {
  return Array.prototype.slice.call(array, begin || 0, end || array.length);
};
