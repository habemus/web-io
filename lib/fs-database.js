// third-party
const HabemusData = require('habemus-data');
// third-party
const Bluebird   = require('bluebird');
const replaceExt = require('replace-ext');
const mime       = require('mime');
const marked     = require('marked');

// promisify
const markedAsync = Bluebird.promisify(marked);

// constants
const HTML_MIME = mime.lookup('.html');
const MARKDOWN_MIME = mime.lookup('.md');

module.exports = function (webIO) {
  
  /**
   * Auxiliary function that generates item data given an item
   */
  function itemMetaData(dataItem, options) {
    var path = webIO.truncateFsRoot(replaceExt(dataItem._path, '.html'));
    var url  = webIO.prependWebsiteRoot(path);
    
    return {
      path: path,
      url: url,
    };
  }
  
  function loadDataReferences(dataItem, options) {
    if (options.skipDataReferences) {
      return;
    } else {
      return webIO.loadDataReferences(dataItem);
    }
  }
  
  function renderMarkdown(dataItem, options) {
    if (mime.lookup(dataItem._path) === MARKDOWN_MIME) {
      return markedAsync(dataItem.content).then((rendered) => {
        return {
          content: rendered,
        };
      });
    }
  }
  
  /**
   * Instantiate an habemus database with the shared parsers
   */
  return new HabemusData({
    parsers: [
     itemMetaData,
      loadDataReferences,
      renderMarkdown,
    ],
    fs: webIO.env.fs,
  });
};
