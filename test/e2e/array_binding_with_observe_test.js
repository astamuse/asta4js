var assert = require('assert');

describe('array binding with observe', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding_with_observe.html';
    
    var getIndexXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]//span[@class='x-index']";
    };
    
    var getInputXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]//input";
    };
    
    var getPreviewXPath = function(idx){
      return "//li[@class='row'][position()=" + idx + "]//span[@id='preview']";
    };
    
    var getButtonXPath = function(idx, btn){
      return "//li[@class='row'][position()=" + idx + "]//button[contains(@class, '"+btn+"')]";
    };
    
    var getObIndexXPath = function(idx){
      return "//li[@class='row-ob'][position()=" + idx + "]//span[@class='x-index-ob']";
    };

    var getObPreviewXPath = function(idx){
      return "//li[@class='row-ob'][position()=" + idx + "]//span[@id='preview-ob']";
    };
    
    var confirmItemValue = function(page, values){
      for(var i=1;i<=values.length;i++){
        (function(idx){
          var v = values[idx-1];
          page.getText(getIndexXPath(idx),function(err, ret){
            assert.strictEqual(ret, (idx-1)+"");
          });
          page.getValue(getInputXPath(idx),function(err, ret){
            assert.strictEqual(ret, v);
          });
          page.getText(getPreviewXPath(idx),function(err, ret){
            assert.strictEqual(ret, v);
          });
          page.getText(getObIndexXPath(idx),function(err, ret){
            assert.strictEqual(ret, (idx-1)+"");
          });
          page.getText(getObPreviewXPath(idx),function(err, ret){
            assert.strictEqual(ret, v + "-observed-changed");
          });
        })(i);
      }
      page.getText(".x-length", function(err, res){
        assert.strictEqual(res, values.length+"");
      });
      page.getText(".x-length-ob", function(err, res){
        assert.strictEqual(res, values.length+"");
      });
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'array binding with observe');
      });
      page.call(done);
    });
    
    it("simple observe test", function(done){
      var page = browser.url(url);
      var v = "aaaaaa";
      page.setValue("#value-input", v);
      page.getText(".x-value", function(err, res){
        assert.strictEqual(res, v);
      });
      page.getText(".x-value-ob", function(err, res){
        assert.strictEqual(res, v + "-observed");
      });
      page.call(done);
    });
    
    it("array assign synchronize test", function(done){
      var page = browser.url(url);
      
      //confirm set value
      page.setValue("#list-data-input", ["r1", "r2", "r3"].join("\n"));
      page.click("#set-list-value");

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