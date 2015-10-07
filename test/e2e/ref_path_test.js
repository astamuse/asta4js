var assert = require('assert');

describe('ref path tests', function() {
    
    var url = 'http://localhost:9001/devstub/refpath.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'ref path');
      });
      page.call(done);
    });
    
    it("transform test", function(done){
      var page = browser.url(url);

      page.getText("#simplevalue", function(err, text){
        assert.strictEqual(text,'simple value here');
      });
      page.getText("#xvalue", function(err, text){
        assert.strictEqual(text,'x value here');
      });
      
      for(var i=1;i<=3;i++){
        (function(idx){
          page.getText("//li[position()=" + idx + "]",function(err, ret){
            assert.strictEqual(ret, idx + "");
          });
        })(i);
      }
      
      page.call(done);
    });
    
    
});