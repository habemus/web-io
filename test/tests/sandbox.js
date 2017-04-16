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
  
  it('#loadDataReferences(data)', function () {
    
    var website1Path = path.join(__dirname, '../fixtures/website-1');
    
    var env = {
      fsRoot: website1Path,
      fs: {
        readFile: function () {
          var args = Array.from(arguments);
          args[0] = path.join(website1Path, args[0]);
          return fs.readFileAsync.apply(null, args);
        }
      }
    }
    
    var website = new WebsiteIO(env);
    
    return website.loadDataReferences({
      'posts@': '/posts/*.md',
      'post1@': '/posts/post-1.md',
    })
    .then(data => {
      
      console.log(data);
      
    })
    
  });
  
  it('aux#evalData(data, sourceData, prefix)', function () {
    
    var data = {
      someProperty: 'current.title',
      categories: 'current.categories',
    };
    
    var sourceData = {
      title: 'Item title',
      categories: [
        'cat-1',
        'cat-2',
        'cat-3',
      ]
    };
    
    var evaluated = require('../../lib/auxiliary').evalData(data, sourceData, 'current');
    
    evaluated.someProperty.should.eql('Item title');
    evaluated.categories.length.should.eql(3);
  });
  
  describe.only('fallbacks', function () {
    it('html -> markdown: /posts/post-1.html -> /posts/post-1.md', function () {
      
      var website = new WebsiteIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return website.loadContext('/posts/post-1.html').then(context => {
        
        console.log(context);
      });
    });
    
    it.skip('paginated html: /index-10.html -> /index.html (page=10)', function () {
      var website = new WebsiteIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return website.loadContext('/index-10.html').then(context => {
        console.log(context);
      });
    });
    
    it.skip('paginated md: /posts-10.html -> /posts.md (page=10)', function () {
      var website = new WebsiteIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return website.loadContext('/posts-10.html').then(context => {
        console.log(context);
      });
    });
  })
});
