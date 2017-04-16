// native
const fs   = require('fs');
const path = require('path');

// third-party
const should = require('should');
const Bluebird = require('bluebird');

// promisify
Bluebird.promisifyAll(fs);

// lib
const WebsiteIO = require('../../');

describe('#render(context)', function () {
  it('renders a context into an html string', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.render({
      title: 'test-title',
      content: '<h1>{{ current.title }}</h1>'
    })
    .then(rendered => {
      rendered.should.eql('<h1>test-title</h1>')
    });
    
  });
  
  it('loads a template if one is defined in the context', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.render({
      title: 'test-title',
      template: '/templates/post.html',
      content: '<h1>content</h1>'
    })
    .then(rendered => {
      rendered.should.startWith('<!DOCTYPE html>');
    });
    
  });
});

describe('#renderPath(templateName, customData)', function () {
  it('loads a template if one is defined in the context', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.renderPath('/posts/post-1.md').then(rendered => {
      rendered.should.startWith('<!DOCTYPE html>');
      /<h1/.test(rendered).should.eql(true);
    });
    
  });
});
