// native
const util = require('util');

/**
 * Base message constructor
 * @param {String} message
 */
function WebIOError(message) {
  Error.call(this);

  this.message = message || 'WebIOError';
};
util.inherits(WebIOError, Error);
WebIOError.prototype.name = 'WebIOError';

/**
 * Happens when any required option is invalid
 *
 * error.option should have the option that is invalid
 * error.kind should contain details on the error type
 * 
 * @param {String} option
 * @param {String} kind
 * @param {String} message
 */
function InvalidOption(option, kind, message) {
  WebIOError.call(this, message);

  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, WebIOError);
InvalidOption.prototype.name = 'InvalidOption';

function RenderError(path, sourceError) {
  
}
util.inherits(RenderError, WebIOError);
RenderError.prototype.name = 'RenderError';

function InvalidLoader(loaderName) {
  this.loader = loaderName;
}
util.inherits(InvalidLoader, WebIOError);
InvalidLoader.prototype.name = 'InvalidLoader';

/**
 * FileNotFound and RenderError
 * are errors that are tied very tightly together.
 * Render Error uses regex to match the path from
 * the message.
 */
function FileNotFound(path) {
  this.path = path;
  this.message = path;
}
util.inherits(FileNotFound, WebIOError);
FileNotFound.prototype.name = 'FileNotFound';

const FILE_NOT_FOUND_RE   = /FileNotFound/;
const UNEXPECTED_TOKEN_RE = /unexpected token/;

function RenderError(sourceError) {
  if (sourceError.name === 'Template render error') {
    // nunjucks error
    this.message = sourceError.message;
    
    if (FILE_NOT_FOUND_RE.test(sourceError.message)) {
      this.kind = 'FileNotFound';
    } else if (UNEXPECTED_TOKEN_RE.test(sourceError.message)) {
      this.kind = 'SyntaxError';
    } else {
      this.kind = 'UnknownRenderError';
    }
  } else {
    this.message = sourceError.message;
  }
}
util.inherits(RenderError, WebIOError);
RenderError.prototype.name = 'RenderError';

exports.WebIOError    = WebIOError;
exports.InvalidOption = InvalidOption;
exports.RenderError   = RenderError;
exports.InvalidLoader = InvalidLoader;
exports.FileNotFound  = FileNotFound;
exports.RenderError   = RenderError;
