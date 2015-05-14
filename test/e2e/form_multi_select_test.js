var assert = require('assert');
var testUtil = require("../testUtil");

describe('form binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/form_multi_select.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'form_multi_select');
      });
      page.call(done);
    });
    
    
    it("form multi select test", function(done){
      var page = browser.url(url);
      
      page.selectByValue("select[name='sv1']", "xx");
      page.getText("#sprev1", function(err, text){
        assert.deepEqual(text, "xx");
      });
      page.getText("#sprev2", function(err, text){
        assert.deepEqual(text, "");
      });
      
      page.selectByValue("select[name='sv2']", "yy");
      page.getText("#sprev1", function(err, text){
        assert.deepEqual(text, "xx");
      });
      page.getText("#sprev2", function(err, text){
        assert.deepEqual(text, "yy");
      });
      
      
      page.call(done);
    });
    
    
    
});