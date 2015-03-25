var assert = require('assert');

describe('array binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding.html';
    
    var getInputXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]//input";
    };
    
    var getPreviewXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]//span[@id='preview']";
    };
    
    var getButtonXPath = function(idx, btn){
      return "//li[@class='row'][position()=" + idx + "]//button[contains(@class, '"+btn+"')]";
    };
    
    var confirmItemValue = function(page, values){
      for(var i=1;i<=values.length;i++){
        (function(idx){
          var v = values[idx-1];
          page.getValue(getInputXPath(idx),function(err, ret){
            assert.strictEqual(ret, v);
          });
          page.getText(getPreviewXPath(idx),function(err, ret){
            assert.strictEqual(ret, v);
          });
        })(i);
      }
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'array_binding');
      });
      page.call(done);
    });
    
    it("array assign synchronize test", function(done){
      var page = browser.url(url);
      
      //confirm set value
      page.setValue("#data-input", ["r1", "r2", "r3"].join("\n"));
      page.click("#set-value");

      page.elements("li.row", function(err, res){
        assert.strictEqual(res.value.length, 3);
      });
      
      confirmItemValue(page, ["r1", "r2", "r3"]);
    
      var newValues = ["r1", "r2", "r3"];
      for(var i=1;i<=3;i++){
        (function(idx){
          var v = "x" + idx;
          page.setValue(getInputXPath(idx), v);
          newValues[idx-1] = v;
          confirmItemValue(page, newValues);
        })(i);
      }
      
      //confirm again
      confirmItemValue(page, newValues);

      //confirm add
      page.click(getButtonXPath(1, "x-add"));
      page.setValue(getInputXPath(2), "add" + 1);
      
      confirmItemValue(page, ["x1", "add1", "x2", "x3"]);

      //confirm remove
      page.click(getButtonXPath(1, "x-remove"));
      
      confirmItemValue(page, ["add1", "x2", "x3"]);

      //confirm move up
      page.click(getButtonXPath(1, "x-go-up"));
      confirmItemValue(page, ["add1", "x2", "x3"]);
      
      page.click(getButtonXPath(2, "x-go-up"));
      confirmItemValue(page, ["x2", "add1", "x3"]);

      page.click(getButtonXPath(3, "x-go-up"));
      confirmItemValue(page, ["x2", "x3", "add1"]);

      //confirm move down      
      page.click(getButtonXPath(3, "x-go-down"));
      confirmItemValue(page, ["x2", "x3", "add1"]);

      page.click(getButtonXPath(2, "x-go-down"));
      confirmItemValue(page, ["x2", "add1", "x3"]);

      page.click(getButtonXPath(1, "x-go-down"));
      confirmItemValue(page, ["add1", "x2", "x3"]);
      
      page.call(done);
    });
    
    /*
    it("input2 synchronize test", function(done){
      //page.click("[name=input1]");
      //page.keys("fasdf");

      page.setValue("[name=input2]", "bbn");
      page.getValue("[name=input1]", function(err, value){
        assert.strictEqual(value,'bbn');
      });
      page.getText("#preview", function(err, text){
        assert.strictEqual(text,'bbn');
      });
      page.call(done);
    });
    */
    
});