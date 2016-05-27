var assert = require('assert');

describe('array asstant test', function() {
    
    var url = 'http://localhost:9001/devstub/arrayassistant.html';
    
    var getIndexXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]/span[@class='x-index']";
    };
    
    var getValueXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]/span[@class='x-value']";
    };
    
    var confirmItemValue = function(page, values){
      for(var i=1;i<=values.length;i++){
        (function(idx){
          var v = values[idx-1];
          page.getText(getIndexXPath(idx),function(err, ret){
            assert.strictEqual(ret, idx + "");
          });
          page.getText(getValueXPath(idx),function(err, ret){
            assert.strictEqual(ret, v + "");
          });
        })(i);
      }
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'arrayassistant');
      });
      page.call(done);
    });
    
    it("get item test", function(done){
      var page = browser.url(url);
      page.click("#btn-0");
      page.getText(".x-verify",function(err, ret){
        assert.strictEqual(ret, "row-1");
      });
      
      page.call(done);
    });
    
    
});