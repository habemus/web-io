// native
const fs   = require('fs');
const path = require('path');

// third-party
const should = require('should');
const Bluebird = require('bluebird');

// promisify
Bluebird.promisifyAll(fs);

// lib
const WebsiteIO = require('../../lib');

describe('#loadDataReferences(data)', function () {
  it('#loadDataReferences(data)', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.loadDataReferences({
      'posts@': '/posts/*.md',
      'post1@': '/posts/post-1.md',
    })
    .then(data => {
      
      data.post1.title.should.eql('post-1');
      data.posts.length.should.eql(3);
    });
    
  });
});

describe('#loadContext(path)', function () {
  it('loads html templates', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.loadContext('templates/post.html')
    .then(context => {
      context.language.should.eql('en');
      context.content.should.startWith('<!DOCTYPE html>')
    });
    
  });

  it.skip('loads markdown templates', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.loadContext('templates/post.md')
    .then(context => {
      context.language.should.eql('en');
      context.content.should.startWith('<h1')
    });
    
  });
});

