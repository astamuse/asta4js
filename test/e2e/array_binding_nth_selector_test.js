var assert = require('assert');

describe('array binding with observe', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding_nth_selector.html';
    
    var getXPath = function(idx){
      return "//li[@class='height-row'][position()=" + idx + "]";
    };
    
    var confirmItemValue = function(page, values){
      for(var i=1;i<=values.length;i++){
        (function(idx){
          var v = values[idx-1];
          page.getText(getXPath(idx),function(err, ret){
            assert.strictEqual(ret, v+"");
          });
        })(i);
      }
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'array_binding_nth_selector');
      });
      page.call(done);
    });
    
    it("selector test", function(done){
      var page = browser.url(url);
      page.click("#check");
      
      page.elements("li.height-row", function(err, res){
        assert.strictEqual(res.value.length, 3);
      });
      
      confirmItemValue(page, ["30px", "50px", "30px"]);

      page.call(done);
    });
    
    
});