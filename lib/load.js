
// third-party
const Bluebird = require('bluebird');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.loadTemplate = function (templatePath) {
  
  return Bluebird.resolve(this.env.fs.readFile(templatePath, 'utf8'))
    .then((templateStr) => {
      switch (mime.lookup(templatePath)) {
        case MARKDOWN_MIME_TYPE:
          return this.parseMarkdown(templateStr);
          break;
        case HTML_MIME_TYPE:
          return this.parseHTML(templateStr);
          break;
        default:
          return this.parseHTML(templateStr);
          break;
      }
    });
};

exports.loadData = function (data) {
  return Bluebird.resolve(data);
};