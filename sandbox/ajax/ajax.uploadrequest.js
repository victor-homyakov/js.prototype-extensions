/*global $, Ajax, Class */

/**
 * Request to upload a file to the server.
 * @param {HTMLInputElement/String} inputFile - input of type="file" to upload
 * @param {String} url - URL on server
 * @param {Object} options - options (onUpload, onSuccess etc.)
 */
Ajax.UploadRequest = Class.create(Ajax.Request, {
  initialize: function($super, inputFile, url, options) {
    //this.inputFile = inputFile; // input type="file"
    options = options || {};
    options.method = options.method || "post";
    options.requestHeaders = options.requestHeaders || {};
    options.requestHeaders["Content-Type"] = options.requestHeaders["Content-Type"] || "application/octet-stream";
    options.postBody = $(inputFile);

    $super(url, options);
  },

  request: function($super, url) {
    if (Object.isFunction(this.options.onUpload)) {
      this.transport.upload.onprogress = this.options.onUpload;
    }
    $super(url);
  }
});


new Ajax.UploadRequest('input_file_id', '/path/to/action', {
  onUpload: function(data) {
    if (data.lengthComputable) {
      // Displaying percent uploaded, draw a progress bar, etc...
      $('ProgressElement').update(Math.floor(100 * data.loaded / data.total) + '%');
    }
  },
  onSuccess: function(xhr) {
    $('ProgressElement').update('OK');
  }
});
