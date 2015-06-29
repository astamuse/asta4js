var assert = require('assert');

describe('virtual path and value ref tests', function() {
    
    var url = 'http://localhost:9001/devstub/virtual_path_and_value_ref.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'virtual path and value ref');
      });
      page.call(done);
    });
    
    it("action test", function(done){
      var page = browser.url(url);
      
      page.getText(".x-show", function(err, text){
        assert.strictEqual(text,'');
      });
      page.getText(".x-show-direct", function(err, text){
        assert.strictEqual(text,'');
      });

      page.click(".x-add");
      page.getText(".x-show", function(err, text){
        assert.strictEqual(text,'1');
      });
      page.getText(".x-show-direct", function(err, text){
        assert.strictEqual(text,'');
      });
      
      page.click(".x-add");
      page.getText(".x-show", function(err, text){
        assert.strictEqual(text,'2');
      });
      page.getText(".x-show-direct", function(err, text){
        assert.strictEqual(text,'');
      });
     
      page.call(done);
    });
    
    
});