var assert = require('assert');

describe('value transform tests', function() {
    
    var url = 'http://localhost:9001/devstub/value_transform.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'value_transform');
      });
      page.call(done);
    });
    
    it("transform test", function(done){
      var page = browser.url(url);
      page.setValue("[name=tint]", "xxx");
      page.click("#prev");//trigger onChange

      page.getText("#prev", function(err, text){
        assert.strictEqual(text,'t:xxx');
      });
      page.getText("#div-caled", function(err, text){
        assert.strictEqual(text,'NaN');
      });
      page.getText("#add-caled", function(err, text){
        assert.strictEqual(text,'xxx1');
      });
      
      page.setValue("[name=tint]", "6");
      page.click("#prev");//trigger onChange

      page.getText("#prev", function(err, text){
        assert.strictEqual(text,'t:6');
      });
      page.getText("#div-caled", function(err, text){
        assert.strictEqual(text,'3');
      });
      page.getText("#add-caled", function(err, text){
        assert.strictEqual(text,'7');
      });
      
      page.call(done);
    });
    
    
});