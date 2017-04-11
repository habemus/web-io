
// third-party
const Bluebird = require('bluebird');
const mime = require('mime');
const glob = require('glob');
const replaceExt = require('replace-ext');

// own
const aux = require('./auxiliary');

// constants
const DATA_PROP_RE = /(.+)@(.*)$/;
const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

exports.loadTemplate = function (templateName) {
  
  return new Bluebird((resolve, reject) => {
    var absoluteTemplatePath = this.absolutePath(templateName);
      
    this.env.fs.readFile(absoluteTemplatePath, 'utf8', (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(res);
    });
  })
  .then((res) => {
    var parsePromise;
    
    if (aux.isMarkdown(templateName)) {
      parsePromise = this.parseMarkdown(res);
    } else if (aux.isHTML(templateName)) {
      parsePromise = this.parseHTML(res);
    } else {
      parsePromise = this.parseHTML(res);
    }
    
    return parsePromise;
  });
};

exports.loadData = function (sourceData) {
  
  var properties = Object.keys(sourceData);
  
  var dataProperties = properties.filter(prop => {
    return DATA_PROP_RE.test(prop);
  });
  
  return Bluebird.all(dataProperties.map(prop => {
    
    var match = prop.match(DATA_PROP_RE);
    
    var dataProperty = match[1];
    var dataSource   = match[2];
    
    var query = sourceData[prop];
    
    dataSource = dataSource || this.env.defaultDataLoader;
    
    var dataLoader = this.env.dataLoaders[dataSource];
    
    return dataLoader(query).then((result) => {
      sourceData[dataProperty] = result;
    });
  }))
  .then(() => {
    return sourceData;
  });
};