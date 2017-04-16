
// third-party
const Bluebird = require('bluebird');
const mime = require('mime');
const glob = require('glob');
const replaceExt = require('replace-ext');

// own
const aux = require('../auxiliary');

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
      
    }, Bluebird.reject(firstErr));
    
  });
  
  
  
  // return item._load(options)
  //   .catch((err) => {
      
  //     if (err.code === 'ENOENT' && aux.isHTML(path)) {
  //       item = this.fsDatabase.item(replaceExt(absolutePath, '.md'));
        
  //       return item._load(options);
  //     } else {
  //       return Bluebird.reject(err);
  //     }
  //   });
};

exports.loadDataReferences = function (sourceData) {
  
  var properties = Object.keys(sourceData);
  
  var references = properties.filter(prop => {
    return DATA_PROP_RE.test(prop);
  });
  
  return Bluebird.all(references.map(referenceProperty => {
    
    var match = referenceProperty.match(DATA_PROP_RE);
    
    var dataProperty = match[1];
    var dataSource   = match[2];
    
    var query = sourceData[referenceProperty];
    
    console.log('delete reference')
    
    // TODO: improve circular relationships
    // Currently we delete the referenceProperty once it
    // has set to be loaded
    // This looks hacky.
    // It has to be done due to the fact that
    // circularity prevents the promise to be executed.
    // may have to do with running things using promises somewhere.
    // (setTimeout(fn, 0))?
    delete sourceData[referenceProperty];
    
    return this.execDataLoader(dataSource, query).then((result) => {
      // set target data property
      sourceData[dataProperty] = result;
    });
  }))
  .then(() => {
    return sourceData;
  });
};
