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

describe('sandbox', function () {
  it('#parseMarkdown(markdown)', function () {
    
    var website = new WebsiteIO();
    
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
      
      parsed.contents.should.startWith('<h1');
      parsed.contents.should.endWith('\n');
    })
    
  });

  it('#loadTemplate(templatePath)', function () {
    
    var website1Path = path.join(__dirname, '../fixtures/website-1');
    
    var env = {
      fs: {
        readFile: function () {
          var args = Array.from(arguments);
          args[0] = path.join(website1Path, args[0]);
          return fs.readFileAsync.apply(null, args);
        }
      }
    }
    
    var website = new WebsiteIO(env);
    
    return website.loadTemplate('templates/post.html').then(parsed => {
      parsed.data.language.should.eql('en');
      parsed.contents.should.startWith('<!DOCTYPE html>');
    })
    
  });
  
  it('#renderString(str, mimeType)', function () {
    
    var website1Path = path.join(__dirname, '../fixtures/website-1');
    
    var env = {
      fs: {
        readFile: function () {
          var args = Array.from(arguments);
          args[0] = path.join(website1Path, args[0]);
          return fs.readFileAsync.apply(null, args);
        }
      }
    }
    
    var website = new WebsiteIO(env);
    
    return website.renderString([
      '---',
      'title: Test post',
      'another-prop: Some data',
      'template: templates/post.html',
      '---',
      '# Test Post',
      '## Some subtitle',
      ''
    ].join('\n'), 'text/x-markdown').then(rendered => {
      
      console.log(rendered);
      
    })
    
  });
});
