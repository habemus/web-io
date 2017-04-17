const path = require('path');

const should = require('should');
const assert = require('assert');

const WebIO = require('../../').WebIO;

describe('errors', function () {
  
  describe('InvalidLoader', function () {
    
    it('should occur when attempting to use a loader that was not previously defined', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.execDataLoader('some-invalid-loader', 'some-query')
        .then(() => {
          throw new Error('error expected');
        }, err => {
          err.name.should.eql('InvalidLoader');
          err.loader.should.eql('some-invalid-loader');
        });
    });
    
    it('should happen when a data reference specifies an undefined loader', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.loadDataReferences({
        'somedata@invalid': 'query',
      })
      .then(() => {
        throw new Error('error expected');
      }, err => {
        err.name.should.eql('InvalidLoader');
        err.loader.should.eql('invalid');
      });
    });
  });
  
  describe('FileNotFound(path)', function () {
    it('should occur when attempting to load a file that does not exist using the fs data loader', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.execDataLoader('fs', '/file-that-does/not/exist.md')
        .then(() => {
          throw new Error('error expected');
        }, err => {
          err.should.be.instanceof(WebIO.errors.WebIOError);
          err.should.be.instanceof(WebIO.errors.FileNotFound);
          err.name.should.eql('FileNotFound');
          err.path.should.eql('/file-that-does/not/exist.md');
        });
    });
    
    it('should occur when attempting to load a context that depends on a file that does not exist', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.loadContext('/file-that-does/not/exist.md')
        .then(() => {
          throw new Error('error expected');
        }, err => {
          err.should.be.instanceof(WebIO.errors.WebIOError);
          err.should.be.instanceof(WebIO.errors.FileNotFound);
          err.name.should.eql('FileNotFound');
          err.path.should.eql('/file-that-does/not/exist.md');
        });
    });
  });
  
  describe('RenderError', function () {
    it('should occur when nunjucks fails to load a given file when rendering because the file does not exist', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.render({
        content: '{% include "/file-that-does-not/exist.html" %} hey',
      })
      .then(() => {
        throw new Error('error expected');
      }, err => {
        
        err.should.be.instanceof(WebIO.errors.RenderError);
        err.message.should.be.instanceof(String);
        err.kind.should.eql('FileNotFound');
      })
    });

    it('should occur when nunjucks fails to load a given file when rendering', function () {
      var webIO = new WebIO({
        fsRoot: path.join(__dirname, '../fixtures/website-1'),
      });
      
      return webIO.render({
        content: '{% include /missing-quotes.html %} hey',
      })
      .then(() => {
        throw new Error('error expected');
      }, err => {
        
        err.should.be.instanceof(WebIO.errors.RenderError);
        err.message.should.be.instanceof(String);
        err.kind.should.eql('SyntaxError');
      })
    });
  })
  
});
