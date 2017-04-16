// third-party
const rootPathBuilder = require('root-path-builder');
const glob            = require('glob');
const Bluebird        = require('bluebird');
const replaceExt      = require('replace-ext');
const mime            = require('mime');
const marked          = require('marked');

// promisify
const markedAsync = Bluebird.promisify(marked);

// constants
const HTML_MIME = mime.lookup('.html');
const MARKDOWN_MIME = mime.lookup('.md');

module.exports = function (webIO) {
  
  return function loadDataFromFs(query) {
    
    if (!query) { throw new Error('query is required'); }
    
    if (typeof query === 'string') {
      query = {
        fsPattern: query,
      };
    }
    
    var skip  = query.skip ? parseInt(query.skip) : false;
    var limit = query.limit ? parseInt(query.limit) : false;
    var sort  = query.sort ? query.sort : false;
    
    var isSingle = !glob.hasMagic(query.fsPattern);
    
    var absolutePattern = webIO.prependFsRoot(query.fsPattern);
    
    if (isSingle) {
      return webIO.fsDatabase.item(absolutePattern)._load();
    } else {
      return webIO.fsDatabase.collection(absolutePattern).find(query.query, {
        skip: skip,
        limit: limit,
        sort: sort,
      });
    }
  };
};
