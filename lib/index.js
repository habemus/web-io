// third-party
const Bluebird = require('bluebird');
const nunjucks = require('nunjucks');



/**
 * Custom nunjucks loader constructor that scopes
 * the template name to the project.
 *
 * Takes the express request as first argument
 */
const WebsiteIONunjucksLoader = nunjucks.Loader.extend({
  init: (websiteIO) => {
    this.websiteIO = websiteIO;
  },

  async: true,

  getSource: (templateName, callback) => {
    
    this.websiteIO.env.fs.readFile(templateName, 'utf8').then((res) => {
      callback(null, res);
    })
    .catch(callback);
  }
});


function WebsiteIO(env) {
  this.env = env || {};
  
  this.env.nunjucks = new nunjucks.Environment(
    new WebsiteIONunjucksLoader(this),
    {
      autoescape: false,
    }
  );
}

Object.assign(WebsiteIO.prototype, require('./parse'));
Object.assign(WebsiteIO.prototype, require('./load'));
Object.assign(WebsiteIO.prototype, require('./render'));

module.exports = WebsiteIO;

