var assert = require('assert');
var testUtil = require("../testUtil");

describe('checkbox option delete tests', function() {
    
    var url = 'http://localhost:9001/devstub/checkbox_option_delete.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'checkbox option delete');
      });
      page.call(done);
    });
    
    
    it("delete option item", function(done){
      var page = browser.url(url);

      page.elements("input", function(err, res){
        assert.strictEqual(res.value.length, 3);
      });
      
      page.click(".x-remove");
      page.elements("input", function(err, res){
        assert.strictEqual(res.value.length, 2);
      });
      
      page.click(".x-remove");
      page.elements("input", function(err, res){
        assert.strictEqual(res.value.length, 1);
      });
      
      page.call(done);
    });
    
});