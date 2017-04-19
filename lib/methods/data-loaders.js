// third-party
const Bluebird = require('bluebird');

// own
const errors = require('../errors');

/**
 * Executes a data loader
 * 
 * @param {String} name
 * @param {Mixed} query
 * @return {Bluebird}
 */
exports.execDataLoader = function (name, query) {
  
  name = name || this.env.defaultDataLoader;
  
  var loader = this.dataLoaders[name];
  
  if (!loader) {
    return Bluebird.reject(new errors.InvalidLoader(name));
  }
  
  return Bluebird.try(() => {
    return loader(this, query);
  });
};

/**
 * Register a data loader
 * 
 * @param {String} name
 * @param {Function} loaderFn
 * @return {Bluebird}
 */
exports.registerDataLoader = function (name, loaderFn) {
  
  if (!name) { throw new Error('name is required'); }
  if (typeof loaderFn !== 'function') {
    throw new TypeError('loaderFn must be a function');
  }
  
  this.dataLoaders[name] = loaderFn;
};
