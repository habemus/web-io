// native

// third-party
const Bluebird = require('bluebird');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

// own
const aux = require('./auxiliary');

exports.render = function (context, customData) {
  
  var loadTemplatePromise = (typeof context.data.template === 'string') ?
    this.loadTemplate(context.data.template, { loadData: true }) :
    Bluebird.resolve(null);
  
  return loadTemplatePromise.then((template) => {
    context.template = template;
    
    return context;
  })
  .then((context) => {
    
    var renderContext;
    var renderString;
    
    if (context.template) {
      renderContext = Object.assign(
        {},
        context.template.data,
        context.data,
        {
          content: context.content,
        },
        customData
      );
      renderString  = context.template.content;
    } else {
      renderContext = context.data;
      renderString  = context.content;
    }
    
    return new Bluebird((resolve, reject) => {
      this.nunjucks.renderString(
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

exports.renderString = function (mimeType, string, customData) {
  
  var parsePromise;
  
  if (mimeType === MARKDOWN_MIME_TYPE) {
    parsePromise = this.parseMarkdown(string, {
      loadData: true
    });
  } else {
    parsePromise = this.parseHTML(string, {
      loadData: true,
    });
  }
  
  return parsePromise.then(context => {
    return this.render(context, customData);
  });
};

exports.renderTemplate = function (templateName, customData) {
  return this.loadTemplate(templateName).then((context) => {
    return this.render(context, customData);
  });
};
