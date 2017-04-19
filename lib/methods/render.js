// native

// third-party
const Bluebird = require('bluebird');
const mime = require('mime');

// constants
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

// own
const aux = require('../auxiliary');
const errors = require('../errors');

// TODO: study whether we should output
// an object instead of only the string results.
// the object would be of the format:
// {
//   path: ...,
//   content: ...
// }

exports.render = function (context, customData) {
  
  var loadTemplateContextPromise;
  
  if (context.template) {
    
    if (typeof context.template !== 'object' ||
        Array.isArray(context.template)) {
      loadTemplateContextPromise = Bluebird.reject(new errors.RenderError({
        message: 'invalid template spec. it must be an object with contents property'
      }));
    } else {
      loadTemplateContextPromise = Bluebird.try(() => {
        return aux.evalData(context.template, context, {
          prefix: 'current'
        });
      })
      .then((tplContext) => {
        // TODO: study performance improvements here,
        // as templates are loaded through data-reference
        // and again re-evaluated here
        return this.loadDataReferences(tplContext, { force: true });
      });
    }
    
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
    })
    .catch(err => {
      throw new errors.RenderError(err);
    });
  });
};

exports.renderPath = function (path, data) {
  
  return this.loadContext(path)
    .then((context) => {
      return this.render(context, data);
    });
};
