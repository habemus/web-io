// third-party
const mime = require('mime');
const traverse = require('traverse');
const objectPath = require('object-path');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.isMarkdown = function (filepath) {
  return mime.lookup(filepath) === MARKDOWN_MIME_TYPE;
};

exports.isHTML = function (filepath) {
  return mime.lookup(filepath) === HTML_MIME_TYPE;
};

/**
 * Evaluates the values of the given data Object
 * against the context Object by matching
 * the given prefix against all string values in the data object.
 * 
 * @param {Object} data
 * @param {Object} context
 * @param {Object} options
 *        - prefix: {String}
 */
exports.evalData = function (data, context, options) {
  
  var DATA_EVAL_RE = new RegExp('^' + options.prefix + '\.(.+)$');
  
  traverse(data).forEach(function (value) {
    
    if (typeof value === 'string') {
      
      var match = value.match(DATA_EVAL_RE);
      
      if (match) {
        var key = match[1];
        
        console.log(key);
        
        this.update(objectPath.get(context, key));
      }
    }
  });
  
  return data;
};
