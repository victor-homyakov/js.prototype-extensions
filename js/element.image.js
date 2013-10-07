/*global $, Element, Image, Prototype */

/**
 * Extensions for Element of type IMG or CANVAS: rotate and scale image.
 *
 * Rotate image (IMG or CANVAS element).
 * Usage: $("idImage").rotate(180); $("idImage").rotateLeft(45); $("idImage").rotateRight();
 * Invoked on: Image, Canvas
 */
(function() {
  function init(e) {
    e = $(e);
    if (!e.original) {
      e.original = {
        w: e.width,
        h: e.height,
        angle: 0,
        zoom: 1,
        img: new Image(),
        loaded: false
      };
      e.original.img.onload = (function() {
        this.loaded = true;
      }).bind(e.original);
      e.original.img.src = e.src;
    }
    return e;
  }

  function call(callback, e) {
    if (Object.isFunction(callback)) {
      //callback.defer(e);
      callback(e);
    }
  }

  function updateSize(e, w, h) {
    // TODO remove debug messages
    if (!w || !h) {
      if (window.console && console.log) {
        console.log("Image#updateSize: w=" + w + " h=" + h);
        if (window.printStackTrace) {
          console.log("Stack trace:\n" + window.printStackTrace().join('\n'));
        }
      } else {
        alert("Image#updateSize: w=" + w + " h=" + h);
        if (window.printStackTrace) {
          alert("Stack trace:\n" + window.printStackTrace().join('\n'));
        }
      }
    }

    e.width = w;
    e.style.width = w + "px";
    e.height = h;
    e.style.height = h + "px";
    return e;
  }

  function updateAngle(e, angle, absolute) {
    e.original.angle = (angle + 360 + (absolute ? 0 : e.original.angle)) % 360;
    return e;
  }

  function updateImgIe(e, callback) {
    var rotation = Math.PI * e.original.angle / 180;
    var costheta = Math.cos(rotation), sintheta = Math.sin(rotation);
    /*var canvas = new Element("img", {
     id: e.id,
     src: e.src,
     height: e.height,
     width: e.width,
     style: "filter:progid:DXImageTransform.Microsoft.Matrix(M11=" + costheta + ",M12=" + (-sintheta) + ",M21=" + sintheta + ",M22=" + costheta + ",SizingMethod='auto expand')"
     });
     canvas.angle = e.angle;
     e.replace(canvas);*/
    e.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + costheta + ",M12=" + (-sintheta) + ",M21=" + sintheta + ",M22=" + costheta + ",SizingMethod='auto expand')";
    call(callback, e);
    return e;
  }

  function updateCanvas(canvas, callback) {
    if (!canvas.original.loaded) { // canvas.original.img.complete
      updateCanvas.defer(canvas, callback);
      return canvas;
    }
    var rotation = Math.PI * canvas.original.angle / 180;
    var costheta = Math.cos(rotation), sintheta = Math.sin(rotation);
    var w = canvas.original.w * canvas.original.zoom, h = canvas.original.h * canvas.original.zoom;
    var cw = costheta * w, ch = costheta * h, sw = sintheta * w, sh = sintheta * h;
    updateSize(canvas, Math.abs(cw) + Math.abs(sh), Math.abs(ch) + Math.abs(sw));

    var context = canvas.getContext("2d");
    context.save();
    if (rotation <= Math.PI / 2) {
      context.translate(sh, 0);
    } else if (rotation <= Math.PI) {
      context.translate(canvas.width, -ch);
    } else if (rotation <= 1.5 * Math.PI) {
      context.translate(-cw, canvas.height);
    } else {
      context.translate(0, -sw);
    }
    context.rotate(rotation);
    context.drawImage(canvas.original.img, 0, 0, w, h);
    context.restore();
    call(callback, canvas);
    return canvas;
  }

  function rotateImgIe(e, angle, absolute, callback) {
    return updateImgIe(updateAngle(init(e), angle, absolute), callback);
  }

  function rotateImg(e, angle, absolute, callback) {
    e = init(e);
    if (angle === 0) { // do not create canvas
      call(callback, e);
      return e;
    }
    var canvas = new Element("canvas", {
      id: e.id,
      className: e.className
    });
    canvas.original = e.original;
    updateCanvas(updateAngle(canvas, angle, absolute), callback);

    //e.replace(canvas);
    var p = e.parentNode;
    if (p) {
      p.replaceChild(canvas, e);
    }
    return canvas;
  }

  function rotateCanvas(e, angle, absolute, callback) {
    return updateCanvas(updateAngle(init(e), angle, absolute), callback);
  }

  function rotateLeft(e, angle) {
    return $(e).rotate(-1 * (angle || 90));
  }
  function rotateRight(e, angle) {
    return $(e).rotate(angle || 90);
  }

  function zoomImg(e, zoom) {
    e = init(e);
    e.original.zoom = zoom;
    return updateSize(e, e.original.w * zoom, e.original.h * zoom);
  }

  function zoomCanvas(e, zoom) {
    e = init(e);
    e.original.zoom = zoom;
    return updateCanvas(e);
  }

  function zoomAndRotateImgIe(e, zoom, angle, absolute, callback) {
    return updateImgIe(updateAngle(zoomImg(e, zoom), angle, absolute), callback);
  }

  function zoomAndRotateImg(e, zoom, angle, absolute, callback) {
    if (angle === 0) { // zoom only - do not create canvas
      zoomImg(e, zoom);
      call(callback, e);
      return e;
    }
    e = init(e);
    e.original.zoom = zoom;
    var canvas = new Element("canvas", {
      id: e.id,
      className: e.className
    });
    canvas.original = e.original;
    updateCanvas(updateAngle(canvas, angle, absolute), callback);

    //e.replace(canvas);
    var p = e.parentNode;
    if (p) {
      p.replaceChild(canvas, e);
    }
    return canvas;
  }

  function zoomAndRotateCanvas(e, zoom, angle, absolute, callback) {
    e = init(e);
    e.original.zoom = zoom;
    return updateCanvas(updateAngle(e, angle, absolute), callback);
  }

  if (Prototype.Browser.IE) {
    Element.addMethods("IMG", {
      zoom: zoomImg,
      rotate: rotateImgIe,
      rotateLeft: rotateLeft,
      rotateRight: rotateRight,
      zoomAndRotate: zoomAndRotateImgIe
    });
  } else {
    Element.addMethods("IMG", {
      zoom: zoomImg,
      rotate: rotateImg,
      rotateLeft: rotateLeft,
      rotateRight: rotateRight,
      zoomAndRotate: zoomAndRotateImg
    });
    Element.addMethods("CANVAS", {
      zoom: zoomCanvas,
      rotate: rotateCanvas,
      rotateLeft: rotateLeft,
      rotateRight: rotateRight,
      zoomAndRotate: zoomAndRotateCanvas
    });
  }
})();
