var assert = require('assert');
var testUtil = require("../testUtil");

describe('virtual path in array tests', function() {
    
    var url = 'http://localhost:9001/devstub/virtual_path_in_array.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'virtual path in array');
      });
      page.call(done);
    });
    
   
    var confirmItemValue = function(page, values, vp_values){
      for(var i=0;i<values.length;i++){
        (function(idx){
          page.getText(".x-index[index='"+idx+"']", function(err, text){
            assert.strictEqual(text, ""+idx);
          });
          page.getText(".x-value[index='"+idx+"']", function(err, text){
            assert.strictEqual(text, values[idx]);
          });
          page.getText(".x-vp-a[index='"+idx+"']", function(err, text){
            var v = vp_values[idx];
            if(v === undefined){
              v = "";
            }else{
              v = "" + v;
            }
            assert.strictEqual(text, v);
          });
          page.getText(".x-vp-b[index='"+idx+"']", function(err, text){
            var v = vp_values[idx];
            if(v === undefined){
              v = "";
            }else{
              v = "" + v * 10;
            }
            assert.strictEqual(text, v);
          });
        })(i);
      }
      page.getText(".x-err", function(err, text){
        assert.strictEqual(text, "");
      })
    }
    
    var clickVp = function(page, idx, times){
      for(var i=0;i<times;i++){
        page.click(".x-inc[index='"+idx+"']");
      }
    }
    
    var clickRm = function(page, idx){
      page.click(".x-remove[index='"+idx+"']");
    }
    
    var confirmOnce=function(page){
      confirmItemValue(page, ["a", "b", "c", "d", "e"], [undefined, undefined, undefined, undefined, undefined]);
      
      for(var i=0;i<5;i++){
        clickVp(page, i, i+1);
      }
      
      confirmItemValue(page, ["a", "b", "c", "d", "e"], [1, 2, 3, 4, 5]);
      
      page.click(".x-inrem");
      
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "in+1", "e"], [1, undefined, undefined, 3, undefined, undefined, 5]);
      
      clickRm(page, 5);
      
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [1, undefined, undefined, 3, undefined,  5]);
      
      clickVp(page, 0, 2);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, undefined, undefined, 3, undefined,  5]);
      
      clickVp(page, 1, 4);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, 4, undefined, 3, undefined,  5]);
      
      clickVp(page, 2, 6);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, 4, 6, 3, undefined,  5]);
      
      clickVp(page, 3, 2);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, 4, 6, 5, undefined,  5]);
      
      clickVp(page, 4, 1);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, 4, 6, 5, 1, 5]);
      
      clickVp(page, 5, 2);
      confirmItemValue(page, ["a", "in+2", "in+3", "c", "in+0", "e"], [3, 4, 6, 5, 1, 7]);
      
      clickRm(page, 2);
      confirmItemValue(page, ["a", "in+2", "c", "in+0", "e"], [3, 4, 5, 1, 7]);
    }
    
    it("common operation", function(done){
      var page = browser.url(url);

      confirmOnce(page);
      
      page.click(".x-reset");
      
      confirmOnce(page);
      
      page.call(done);
    });
    
    it("insert into empty", function(done){
      var page = browser.url(url);

      page.click(".x-rem");
      
      page.click(".x-ins");
      
      confirmOnce(page);
      
      page.call(done);
    });
    
});