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
  
  var loadTemplatePromise;
  
  if (typeof context.template === 'string') {
    loadTemplatePromise = this.loadTemplate(context.template, {
      // wait to load data references
      loadDataReferences: false,
    })
    .then((tplContext) => {
      // eval template data
      tplContext = aux.evalData(tplContext, context, {
        prefix: 'current'
      });
      
      return this.loadDataReferences(tplContext).then((loaded) => {
        tplContext = loaded;
        return tplContext;
      });
    });
    
  } else {
    loadTemplatePromise = Bluebird.resolve(null);
  }
  
  return loadTemplatePromise.then((tplContext) => {
    context.template = tplContext;
    
    return context;
  })
  .then((context) => {
    
    var renderContext = customData || {};
    var renderString;
    
    if (context.template) {
      pageData = Object.assign(
        {},
        context.template.data,
        context,
        {
          content: context.content,
        }
      );
      renderContext.current = pageData;
      renderString          = context.template.content;
    } else {
      renderContext.current = context;
      renderString          = context.content;
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

// exports.renderString = function (mimeType, string, customData) {
  
//   var parsePromise;
  
//   if (mimeType === MARKDOWN_MIME_TYPE) {
//     parsePromise = this.parseMarkdown(string, {
//       loadDataReferences: true
//     });
//   } else {
//     parsePromise = this.parseHTML(string, {
//       loadDataReferences: true,
//     });
//   }
  
//   return parsePromise.then(context => {
//     return this.render(context, customData);
//   });
// };

// exports.renderTemplate = function (templateName, customData) {
//   return this.loadTemplate(templateName, { loadDataReferences: true }).then((context) => {
//     return this.render(context, customData);
//   });
// };

exports.renderPath = function (path, data) {
  return this.loadTemplate(path).then((context) => {
    return this.render(context, data);
  });
};
