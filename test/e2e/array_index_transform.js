var assert = require('assert');

describe('array index transform', function() {
    
    var url = 'http://localhost:9001/devstub/array_index_transform.html';
    
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
         assert.strictEqual(title,'array_index_transform');
      });
      page.call(done);
    });
    
    it("index transform test", function(done){
      var page = browser.url(url);
       
      confirmItemValue(page, [11,22,33]);
      
      page.call(done);
    });
    
    
});