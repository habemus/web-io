// third-party
const glob     = require('glob');
const Bluebird = require('bluebird');

// own
const errors = require('../errors');

function _loadSingle(webIO, absolutePattern, query) {
  return webIO.fsDatabase.item(absolutePattern)._load().catch(err => {
    if (err.code === 'ENOENT') {
      throw new errors.FileNotFound(query.pattern);
    } else {
      throw err;
    }
  });
}

function _loadMultiple(webIO, absolutePattern, query) {
  var skip  = query.skip ? parseInt(query.skip) : false;
  var limit = query.limit ? parseInt(query.limit) : false;
  var sort  = query.sort ? query.sort : false;
  
  return webIO.fsDatabase.collection(absolutePattern).find(query.query, {
    skip: skip,
    limit: limit,
    sort: sort,
  });
}

module.exports = function (webIO, query) {
  if (!query) { throw new Error('query is required'); }
  
  if (typeof query === 'string') {
    query = {
      pattern: query,
    };
  }
  
  var isSingle        = !glob.hasMagic(query.pattern);
  var absolutePattern = webIO.prependFsRoot(query.pattern);
  
  if (isSingle) {
    return _loadSingle(webIO, absolutePattern, query);
  } else {
    return _loadMultiple(webIO, absolutePattern, query);
  }
};
