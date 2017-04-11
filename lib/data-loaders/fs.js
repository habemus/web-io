// third-party
const rootPathBuilder = require('root-path-builder');
const DataCollection  = require('habemus-data').Collection;
const DataItem        = require('habemus-data').Item;
const glob            = require('glob');
const Bluebird        = require('bluebird');
const marked          = require('marked');

// promisify
const markedAsync = Bluebird.promisify(marked);

module.exports = function (websiteIO) {
  
  var fsRoot = websiteIO.env.fsRoot;
  
  if (!fsRoot) {
    throw new Error('env.fsRoot is required');
  }
  
  var root = rootPathBuilder(fsRoot);
  
  return function loadDataFromFs(query) {
    
    if (!query) {
      throw new Error('query is required');
    }
    
    if (typeof query === 'string') {
      query = {
        fsPattern: query,
      };
    }
    
    var isSingle = !glob.hasMagic(query.fsPattern);
    
    var absolutePattern = root.prependTo(query.fsPattern);
    
    if (isSingle) {
      // only one file
      return new DataItem(absolutePattern)._load().then((item) => {
        return item.toJSON();
      });
      
    } else {
      // multiple files
      return new DataCollection(absolutePattern).find(query.query)
        .then((items) => {
          return items.map((item) => {
            return item.toJSON();
          });
        });
    }
  };
};
