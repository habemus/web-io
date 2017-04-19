// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');
const superagent = require('superagent');

module.exports = function (webIO, query) {
  
  if (typeof query === 'string') {
    query = {
      url: query,
    };
  }
  
  return new Bluebird((resolve, reject) => {
    superagent.get(query.url).end((err, res) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (res.body) {
        // superagent attempts to automatically parse
        // the text into a body.
        resolve(res.body);
      } else {
        resolve(res.text);
      }
    });
  });
};
