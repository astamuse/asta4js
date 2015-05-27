var assert = require('assert');

describe('array binding with observe', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding_discard.html';
    
    var getXPath = function(idx){
      return "//li[@class='sub-row'][position()=" + idx + "]";
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
         assert.strictEqual(title,'array_binding_discard');
      });
      page.call(done);
    });
    
    it("discard test", function(done){
      var page = browser.url(url);
      var test = function(){
        var v = "[[1,2,3]]";
        page.setValue("#value-input", v);
        page.click("button");
        
        page.elements("li.row", function(err, res){
          assert.strictEqual(res.value.length, 1);
        });
        
        page.elements("li.sub-row", function(err, res){
          assert.strictEqual(res.value.length, 3);
        });
        
        confirmItemValue(page, [1,2,3]);
        
        page.setValue("#value-input", "[]");
        page.click("button");
        
        page.elements("li.row", function(err, res){
          assert.strictEqual(res.value.length, 0);
        });
        
        page.elements("li.sub-row", function(err, res){
          assert.strictEqual(res.value.length, 0);
        });
      };
      
      //to reproduce the dicard exception, we have to do the test cycle at least twice.
      test();
      test();

      page.call(done);
    });
    
    
});