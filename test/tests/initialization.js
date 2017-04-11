// native
const fs   = require('fs');
const path = require('path');
const assert = require('assert');

// third-party
const should = require('should');
const Bluebird = require('bluebird');

// promisify
Bluebird.promisifyAll(fs);

// lib
const WebIO = require('../../lib');

describe('new WebIO(env)', function () {
  it('should require env', function () {
    
    assert.throws(function () {
      var website = new WebIO();
    });
    
    assert.throws(function () {
      var website = new WebIO({
        fsRoot: undefined
      });
    });
    
    assert.throws(function () {
      var website = new WebIO({
        fsRoot: 'not-absolute/path'
      });
    });
  });

  it('should initialize properly given all required env configurations', function () {
    var website = new WebIO({
      fsRoot: '/abs/path'
    });
  });
});
