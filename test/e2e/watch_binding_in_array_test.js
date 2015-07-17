var assert = require('assert');
var testUtil = require("../testUtil");

describe('watch binding in array tests', function() {
    
    var url = 'http://localhost:9001/devstub/watch_binding_in_array.html';
    var getInputXPath = function(idx){
      return "//li[@class='x-row'][position()=" + idx + "]//input";
    };
    var getSpanXPath = function(idx){
      return "//li[@class='x-row'][position()=" + idx + "]//span";
    };
    var getButtonXPath = function(idx){
      return "//li[@class='x-row'][position()=" + idx + "]//button";
    };
    var confirmItemValue = function(page, values){
      for(var i=1;i<=values.length;i++){
        (function(idx){
          var v = values[idx-1];
          page.getValue(getInputXPath(idx),function(err, ret){
            assert.strictEqual(ret, v);
          });
          page.getText(getSpanXPath(idx),function(err, ret){
            assert.strictEqual(ret, v+"-watched");
          });
        })(i);
      }
      page.elements("input", function(err, res){
        assert.strictEqual(res.value.length, values.length);
      });
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'watch_binding_in_array');
      });
      page.call(done);
    });
    
    
    it("delete option item", function(done){
      var page = browser.url(url);

      confirmItemValue(page, ["aaa", "bbb", "ccc", "ddd"])
      
      page.click(getButtonXPath(4));
      confirmItemValue(page, ["aaa", "bbb", "ccc"])
      
      page.click(getButtonXPath(2));
      confirmItemValue(page, ["aaa", "ccc"])
      
      page.click(getButtonXPath(1));
      confirmItemValue(page, ["ccc"])
      
      page.click(getButtonXPath(1));
      confirmItemValue(page, [])
      
      page.call(done);
    });
    
});