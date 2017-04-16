// third-party
const Bluebird = require('bluebird');
const nunjucks = require('nunjucks');

// own
const aux = require('./auxiliary');

/**
 * Custom nunjucks loader constructor that scopes
 * the template name to the project.
 *
 * Takes the express request as first argument
 */
var WebIONunjucksLoader = nunjucks.Loader.extend({
  init: (webIO) => {
    this.webIO = webIO;
  },

  async: true,

  getSource: (templateName, cb) => {
    return this.webIO.loadContext(templateName).then((res) => {
      cb(null, {
        src: res.content
      });
    })
    .catch(cb);
  }
});

module.exports = function createNunjucksEnv(webIO) {
  return new nunjucks.Environment(
    new WebIONunjucksLoader(webIO),
    {
      autoescape: false,
    }
  );
};
