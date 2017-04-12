// third-party
const marked = require('marked');
const Bluebird = require('bluebird');
const grayMatter = require('gray-matter');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.parseHTML = function (html, options) {
  
  options = options || {};
  
  return new Bluebird((resolve, reject) => {
    var parsed = grayMatter(html);
    resolve({
      data: parsed.data,
      content: parsed.content,
    });
  })
  .then((context) => {
    
    if (options.loadData) {
      return this.loadData(context.data).then((data) => {
        context.data = data;
        return context;
      });
    } else {
      return context;
    }
  });
};

/**
 * Parses the given markdown string into a parsed object with
 * the front-matter data and the file content already rendered into html.
 * 
 * @param  {String} markdown
 * @param  {Object} options
 * @return {Object}
 *         - content: HTML String
 *         - ... (other data from the front matter)
 */
exports.parseMarkdown = function (markdown, options) {
  
  options = options || {};
  
  return new Bluebird((resolve, reject) => {

    var parsed = grayMatter(markdown);

    var markdownContent = parsed.content || '';

    marked(markdownContent, {}, (err, renderedHTML) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          data: parsed.data,
          content: renderedHTML,
        });
      }
    });

  })
  .then((context) => {
    
    if (options.loadData) {
      return this.loadData(context.data).then((data) => {
        context.data = data;
        return context;
      });
    } else {
      return context;
    }
  });
};

exports.parse = function (string, mimeType, options) {
  if (mimeType === MARKDOWN_MIME_TYPE) {
    return this.parseMarkdown(string, options);
  } else if (mimeType === HTML_MIME_TYPE) {
    return this.parseHTML(string, options);
  } else {
    return this.parseHTML(string, options);
  }
};
