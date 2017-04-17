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

function TemplateNotFound() {
  
}
util.inherits(TemplateNotFound, WebIOError);
TemplateNotFound.prototype.name = 'TemplateNotFound';

function PathNotFound() {
  
}
util.inherits(PathNotFound, WebIOError);
PathNotFound.prototype.name = 'PathNotFound';

exports.WebIOError = WebIOError;
exports.InvalidOption = InvalidOption;
exports.PathNotFound = PathNotFound;
exports.TemplateNotFound = TemplateNotFound;
