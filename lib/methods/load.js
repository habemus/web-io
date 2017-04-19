
// third-party
const Bluebird = require('bluebird');
const mime = require('mime');
const glob = require('glob');
const replaceExt = require('replace-ext');
const HabemusData = require('habemus-data');

// own
const aux = require('../auxiliary');
const errors = require('../errors');

// constants
const DATA_PROP_RE = /(.+)@(.*)$/;
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

const PAGINATED_HTML_PATH_RE = /(.+)-([0-9]+)\.html$/;

const LOAD_CONTEXT_PATH_FALLBACKS = [
  /**
   * .html to .md
   * 
   */
  {
    name: 'html -> md',
    condition: function (err, sourcePath, options) {
      
      return err.code === 'ENOENT' &&
             mime.lookup(sourcePath) === HTML_MIME_TYPE;
      
    },
    path: function (err, sourcePath, options) {
      
      return replaceExt(sourcePath, '.md');
    },
  },
  // {
  //   name: 'html: paginated with html extension',
  //   condition: function (err, sourcePath, options) {
  //     return err.code === 'ENOENT' && PAGINATED_HTML_PATH_RE.test(sourcePath);
  //   },
  //   path: function (err, sourcePath, options) {
      
  //     var match = sourcePath.match(PAGINATED_HTML_PATH_RE);
      
  //     // use .html extension in the path
  //     var path = match[1] + '.html';
  //     var page = parseInt(match[2]);
      
  //     return path;
  //   },
  // },
  // {
  //   name: 'html: paginated with md extension',
  //   condition: function (err, sourcePath, options) {
  //     return err.code === 'ENOENT' && PAGINATED_HTML_PATH_RE.test(sourcePath);
  //   },
  //   path: function (err, sourcePath, options) {
      
  //     var match = sourcePath.match(PAGINATED_HTML_PATH_RE);
      
  //     // use .md extension in the path
  //     var path = match[1] + '.md';
  //     var page = parseInt(match[2]);
      
  //     return path;
  //   },
  // }
];



exports.loadContext = function (path, options) {
  var absolutePath = this.prependFsRoot(path);
  
  var item = this.fsDatabase.item(absolutePath);
  
  var firstAttempt = item._load(options);
  
  // variable to store the original error
  var firstErr;
  
  return firstAttempt.catch(err => {
    firstErr = err;
    
    return LOAD_CONTEXT_PATH_FALLBACKS.reduce((lastAttempt, fallback, index) => {
      
      return lastAttempt.catch((err) => {
        
        if (fallback.condition(err, path, options)) {
          var attemptPath = fallback.path(err, path, options);
          var attemptAbsolutePath = this.prependFsRoot(attemptPath);
          var attemptItem = this.fsDatabase.item(attemptAbsolutePath);
          return attemptItem._load(options);
          
        } else {
          
          if (index === 0) {
            firstErr = err;
          }
          
          if (index === LOAD_CONTEXT_PATH_FALLBACKS.length) {
            // this is the last fallback, thus no more attempts
            // will be made. Reject with the original error
            return Bluebird.reject(firstErr);
          } else {
            // more attempts will be made, thus reject with the current
            // error
            return Bluebird.reject(err);
          }
        }
        
      });
      
    }, Bluebird.reject(firstErr))
    .catch(err => {
      if (err.code === 'ENOENT') {
        throw new errors.FileNotFound(path);
      } else {
        throw err;
      }
    });
    
  });
};

function parseDataReferenceProperty(property) {
  var match = property.match(DATA_PROP_RE);
  
  if (!match) {
    return false;
  }
  
  return {
    property: property,
    target: match[1],
    loader: match[2],
  };
}

exports.loadDataReferences = function (dataItem, options) {
  
  if (!(dataItem instanceof HabemusData.Item)) {
    return Bluebird.resolve();
  }
  
  options = options || {}
  options.force = options.force || false;
  
  var references = Object.keys(dataItem).map(parseDataReferenceProperty);
  references = references.filter(ref => {
    if (!ref) { return false; }
    
    var force = options.force;
    var hasBeenLoaded = dataItem[ref.target] !== undefined;
    
    if (force || !hasBeenLoaded) {
      return true;
    } else {
      return false;
    }
  });
  
  return Bluebird.all(references.map(ref => {
    
    var query = dataItem[ref.property];
    
    // TODO: improve circular relationships
    // Currently we delete the referenceProperty once it
    // has set to be loaded
    // This looks hacky.
    // It has to be done due to the fact that
    // circularity prevents the promise to be executed.
    // may have to do with running things using promises somewhere.
    // (setTimeout(fn, 0))?
    // improvement:
    // delete dataItem[referenceProperty];

    // temporarily set it to an empty value
    // other than undefined
    dataItem[ref.target] = null;

    return this.execDataLoader(ref.loader, query).then((result) => {
      // set target data property
      dataItem[ref.target] = result;
    });
  }))
  .then(() => {
    return dataItem;
  });
};
