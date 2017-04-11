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

describe('#parseMarkdown(markdown, options)', function () {
  it('renders the markdown into html and parses front-matter', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.parseMarkdown([
      '---',
      'title: Test post',
      'another-prop: Some data',
      '---',
      '# Test Post',
      '## Some subtitle',
      ''
    ].join('\n'))
    .then(parsed => {
      parsed.data.title.should.eql('Test post');
      parsed.data['another-prop'].should.eql('Some data');
      
      parsed.content.should.startWith('<h1');
      parsed.content.should.endWith('\n');
    });
    
  });
  
  it('loads data if the options.loadData is set', function () {
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.parseMarkdown([
      '---',
      'title: Test post',
      'another-prop: Some data',
      'posts@: /posts/*.md',
      '---',
      '# Test Post',
      '## Some subtitle',
      ''
    ].join('\n'), {
      loadData: true
    })
    .then(parsed => {
      parsed.data.title.should.eql('Test post');
      parsed.data['another-prop'].should.eql('Some data');
      parsed.data.posts.length.should.eql(3);
      
      parsed.content.should.startWith('<h1');
      parsed.content.should.endWith('\n');
    });
  });
});

describe('#parseHTML(html, options)', function () {
  it('parses the html and the front-matter', function () {
    
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.parseHTML([
      '---',
      'language: en',
      '---',
      '<!DOCTYPE html>',
      '<html>',
        '<head>',
          '<meta http-equiv="content-type" content="text/html; charset=utf-8" />',
          '<title>Page title</title>',
        '</head>',
        '<body>',
          '{{ contents }}',
        '</body>',
      '</html>',
    ].join('\n'))
    .then(parsed => {
      parsed.data.language.should.eql('en');
      
      parsed.content.should.startWith('<!DOCTYPE html>');
    });
    
  });
  
  it('loads data if the options.loadData is set', function () {
    var website = new WebsiteIO({
      fsRoot: path.join(__dirname, '../fixtures/website-1'),
    });
    
    return website.parseHTML([
      '---',
      'language: en',
      'posts@: /posts/*.md',
      '---',
      '<!DOCTYPE html>',
      '<html>',
        '<head>',
          '<meta http-equiv="content-type" content="text/html; charset=utf-8" />',
          '<title>Page title</title>',
        '</head>',
        '<body>',
          '{{ contents }}',
        '</body>',
      '</html>',
    ].join('\n'), {
      loadData: true
    })
    .then(parsed => {
      parsed.data.language.should.eql('en');
      
      parsed.content.should.startWith('<!DOCTYPE html>');
      parsed.data.posts.length.should.eql(3);
    });
  });
});
