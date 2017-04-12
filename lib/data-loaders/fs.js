// third-party
const rootPathBuilder = require('root-path-builder');
const DataCollection  = require('habemus-data').Collection;
const DataItem        = require('habemus-data').Item;
const glob            = require('glob');
const Bluebird        = require('bluebird');
const replaceExt      = require('replace-ext');

module.exports = function (webIO) {
  
  // var fsRoot = webIO.env.fsRoot;
  // var websiteRoot = webIO.env.websiteRoot || false;
  
  // if (!fsRoot) {
  //   throw new Error('env.fsRoot is required');
  // }
  
  // var root = rootPathBuilder(fsRoot);
  // websiteRoot = websiteRoot ?
  //   rootPathBuilder(websiteRoot) : false;
  
  /**
   * Auxiliary function that generates item data given an item
   */
  function getItemData(item) {
    var data = item.toJSON();
    
    var path = webIO.fsTruncatePath(replaceExt(item._filepath, '.html'));
    var url  = webIO.websitePrependPath(path);
    
    return Object.assign({}, {
      // useful metadata
      path: path,
      url: url,
    }, data);
  }
  
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
    
    var absolutePattern = webIO.fsPrependPath(query.fsPattern);
    
    if (isSingle) {
      // only one file
      return new DataItem(absolutePattern, null, {fs: webIO.env.fs})._load().then(getItemData);
      
    } else {
      // multiple files
      return new DataCollection(absolutePattern, {fs: webIO.env.fs}).find(query.query)
        .then((items) => {
          return items.map(getItemData);
        });
    }
  };
};
