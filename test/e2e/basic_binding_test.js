var assert = require('assert');

describe('basic binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/basic_binding.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'basic_binding');
      });
      page.call(done);
    });
    
    it("input synchronize test", function(done){
      
      var page = browser.url(url);
      
      //confirm input1
      page.setValue("[name=input1]", "fasd");
      page.getValue("[name=input2]", function(err, value){
        assert.strictEqual(value,'fasd');
      });
      page.getText("#preview", function(err, text){
        assert.strictEqual(text,'fasd');
      });

      //confirm input2
      page.setValue("[name=input2]", "bbn");
      page.getValue("[name=input1]", function(err, value){
        assert.strictEqual(value,'bbn');
      });
      page.getText("#preview", function(err, text){
        assert.strictEqual(text,'bbn');
      });
      page.call(done);
    });
    
});