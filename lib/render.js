// native

// third-party
const Bluebird = require('bluebird');
const nunjucks = require('nunjucks');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.render = function (context) {
  
  var loadTemplatePromise = (typeof context.data.template === 'string') ?
    this.loadTemplate(context.data.template) : Bluebird.resolve(null);
  
  return loadTemplatePromise.then((template) => {
    context.template = template;
    
    return context;
  })
  .then((context) => {
    
    var renderContext;
    var renderString;
    
    if (context.template) {
      renderContext = Object.assign({}, context.template.data, context.data, {
        contents: context.contents,
      });
      renderString  = context.template.contents;
    } else {
      renderContext = context.data;
      renderString  = context.contents;
    }
    
    return new Bluebird((resolve, reject) => {
      this.env.nunjucks.renderString(
        renderString,
        renderContext,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  });
};

exports.renderString = function (string, mimeType) {
  
  var parsePromise;
  
  if (mimeType === MARKDOWN_MIME_TYPE) {
    parsePromise = this.parseMarkdown(string);
  } else {
    parsePromise = this.parseHTML(string);
  }
  
  return parsePromise.then(context => {
    return this.render(context);
  });
};
