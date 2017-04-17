// third-party
const glob     = require('glob');
const Bluebird = require('bluebird');

// own
const errors = require('../errors');

module.exports = function (webIO) {
  
  function _loadSingle(absolutePattern, query) {
    return webIO.fsDatabase.item(absolutePattern)._load().catch(err => {
      if (err.code === 'ENOENT') {
        throw new errors.FileNotFound(query.fsPattern);
      } else {
        throw err;
      }
    });
  }
  
  function _loadMultiple(absolutePattern, query) {
    var skip  = query.skip ? parseInt(query.skip) : false;
    var limit = query.limit ? parseInt(query.limit) : false;
    var sort  = query.sort ? query.sort : false;
    
    return webIO.fsDatabase.collection(absolutePattern).find(query.query, {
      skip: skip,
      limit: limit,
      sort: sort,
    });
  }
  
  return function loadDataFromFs(query) {
    
    if (!query) { throw new Error('query is required'); }
    
    if (typeof query === 'string') {
      query = {
        fsPattern: query,
      };
    }
    
    var isSingle        = !glob.hasMagic(query.fsPattern);
    var absolutePattern = webIO.prependFsRoot(query.fsPattern);
    
    if (isSingle) {
      return _loadSingle(absolutePattern, query);
    } else {
      return _loadMultiple(absolutePattern, query);
    }
  };
};
