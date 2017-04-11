// third-party
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.isMarkdown = function (filepath) {
  return mime.lookup(filepath) === MARKDOWN_MIME_TYPE;
};

exports.isHTML = function (filepath) {
  return mime.lookup(filepath) === HTML_MIME_TYPE;
};
