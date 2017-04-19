// native
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const rootPathBuilder = require('root-path-builder');

/**
 * Constructor
 */
function WebIO(env) {
  
  if (!env) { throw new Error('env is required'); }
  if (typeof env.fsRoot !== 'string') { throw new TypeError('env.fsRoot must be a String'); }
  if (!path.isAbsolute(env.fsRoot)) { throw new Error('env.fsRoot must be an absolute path'); }
  
  this.env = env;
  
  /**
   * The fs module to be used for reading files
   */
  this.env.fs = this.env.fs || require('fs');
  
  /**
   * Root path builder used for creating absolute paths
   */
  this.fsRootPathBuilder = rootPathBuilder(this.env.fsRoot);
  
  /**
   * Root path builder used for creating paths relative to the
   * website
   */
  this.websiteRootPathBuilder = (this.env.websiteRoot && this.env.websiteRoot !== '/') ?
    rootPathBuilder(this.env.websiteRoot) : false;
  
  /**
   * Instance of HabemusData
   * Used for loading files and loading data from the filesystem
   * 
   * @type {HabemusData}
   */
  this.fsDatabase = require('./fs-database')(this);
  
  /**
   * Instance of nunjucks environment
   * 
   * @type {nunjucks.Environment}
   */
  this.nunjucks = require('./nunjucks-env')(this);
  
  /**
   * Data loaders are used for retrieving data
   * for rendering.
   */
  this.dataLoaders = Object.assign({}, this.env.dataLoaders);
  
  // register the built-in dataLoaders
  this.registerDataLoader('fs', require('./data-loaders/fs'));

  /**
   * Use `fs` as the default data loader
   */
  this.env.defaultDataLoader = this.env.defaultDataLoader || 'fs';
}

Object.assign(WebIO.prototype, require('./methods/path'));
Object.assign(WebIO.prototype, require('./methods/load'));
Object.assign(WebIO.prototype, require('./methods/render'));
Object.assign(WebIO.prototype, require('./methods/data-loaders'));

// expose errors
WebIO.errors = require('./errors');

module.exports = function (env) {
  return new WebIO(env);
};

module.exports.WebIO = WebIO;
module.exports.errors = require('./errors');

// expose some built-in loaders
module.exports.dataLoaders = {
  fs: require('./data-loaders/fs'),
  http: require('./data-loaders/http'),
};
