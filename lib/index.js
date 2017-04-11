// native
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const nunjucks = require('nunjucks');
const rootPathBuilder = require('root-path-builder');

// own
const NunjucksLoader = require('./nunjucks/loader');

function WebIO(env) {
  
  if (!env) {
    throw new Error('env is required');
  }
  
  if (typeof env.fsRoot !== 'string') {
    throw new TypeError('env.fsRoot must be a String');
  }
  
  if (!path.isAbsolute(env.fsRoot)) {
    throw new Error('env.fsRoot must be an absolute path');
  }
  
  this.env = env;
  
  /**
   * The fs module to be used for reading files
   */
  this.env.fs = this.env.fs || require('fs');
  
  /**
   * Root path builder used for creating absolute paths
   */
  this.rootPathBuilder = rootPathBuilder(this.env.fsRoot);
  
  /**
   * Instance of nunjucks environment
   */
  this.nunjucks = new nunjucks.Environment(
    new NunjucksLoader(this),
    {
      autoescape: false,
    }
  );
  
  /**
   * Data loaders are used for retrieving data
   * for rendering.
   */
  this.env.dataLoaders = this.env.dataLoaders || {};
  
  /**
   * Use fs as the default data loader
   */
  this.env.defaultDataLoader = this.env.defaultDataLoader || 'fs';
  
  if (!this.env.dataLoaders.fs) {
    this.registerDataLoader('fs', require('./data-loaders/fs')(this));
  }
}

WebIO.prototype.absolutePath = function (path) {
  return this.rootPathBuilder.prependTo(path);
};

WebIO.prototype.registerDataLoader = function (name, loader) {
  this.env.dataLoaders[name] = loader;
};

Object.assign(WebIO.prototype, require('./parse'));
Object.assign(WebIO.prototype, require('./load'));
Object.assign(WebIO.prototype, require('./render'));

module.exports = WebIO;

