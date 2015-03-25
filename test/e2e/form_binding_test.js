var assert = require('assert');

describe('form binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/form_binding.html';
    
    var getValueOfCR=function(page, selector, callback){
      //var elemIds = [];
      var retVals = [];
      page.elements(selector, function(err, ret){
        if(err){
          callback(err);
          return;
        }
        ret.value.forEach(function(r){
          var id = r.ELEMENT;
          page.elementIdAttribute(id, "checked", function(err,ck){
            if(err){
              callback(err);
              return;
            }
            if(ck){
              page.elementIdAttribute(id, "value", function(err, r){
                if(err){
                  callback(err);
                  return;
                }
                retVals.push(r.value);
              });
            }
          });
        });
      });
      //fake operation to arrange the callback
      page.status(function(err, status){
        callback(null, retVals);
      });
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'form_binding');
      });
      page.call(done);
    });
    
    
    it("form input test", function(done){
      var page = browser.url(url);
      

      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {});
      });
      
      page.setValue("#data-input", JSON.stringify({
          "name": "nnn",
          "bloodType": "AB",
          "sex": "0",
          "language": ["English"],
          "private": true,
          "desc": "aaa\nbbb"
        }
      ));
      page.click("#set-value");
      
      page.getValue("[name=name]", function(err, value){
        assert.strictEqual(value, "nnn");
      });
      page.getText("#name-pre", function(err, text){
        assert.strictEqual(text, "nnn");
      });
      
      page.getValue("[name=bloodType]", function(err, value){
        assert.strictEqual(value, "AB");
      });
      page.getText("#bloodType-pre", function(err, text){
        assert.strictEqual(text, "AB");
      });
      
      getValueOfCR(page, "[name=sex]", function(err, vals){
        assert.deepEqual(vals, ["0"]);
      });
      page.getText("#sex-pre", function(err, text){
        assert.strictEqual(text, "0");
      });
      
      getValueOfCR(page, "[name=language]", function(err, vals){
        assert.deepEqual(vals, ["English"]);
      });
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "English");
      });
      
      page.getAttribute("[name=private]", "checked", function(err, ck){
        assert.strictEqual(Boolean(ck), true);
      });
      page.getAttribute("[name=agree]", "checked", function(err, ck){
        assert.strictEqual(Boolean(ck), false);
      });
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn",
          "bloodType": "AB",
          "sex": "0",
          "language": ["English"],
          "private": true,
          "desc": "aaa\nbbb"
        });
      });
      /*
      page.setValue("[name=year]", "y");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'y-undefined-undefined:undefined');
      });
      page.setValue("[name=month]", "m");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'y-m-undefined:undefined');
      });
      page.setValue("[name=day]", "d");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'y-m-d:undefined');
      });
      page.setValue("[name=babe]", "bbb");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'y-m-d:bbb');
      });
      */
      page.call(done);
    });
    
    
    
});