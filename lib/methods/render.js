// native

// third-party
const Bluebird = require('bluebird');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

// own
const aux = require('../auxiliary');

exports.render = function (context, template, customData) {
  
  var loadTemplateContextPromise;
  
  if (typeof context.template === 'string') {
    loadTemplateContextPromise = this.loadContext(context.template, {
      skipDataReferences: true,
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
    loadTemplateContextPromise = Bluebird.resolve(null);
  }
  
  return loadTemplateContextPromise.then((tplContext) => {
    
    var renderContext = customData || {};
    var renderString;
    
    if (tplContext) {
      pageData = Object.assign(
        {},
        tplContext,
        context
      );
      renderContext.current = pageData;
      renderString          = tplContext.content;
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

exports.renderPath = function (path, data) {
  
  return this.loadContext(path)
    .then((context) => {
      return this.render(context, data);
    });
};
