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
            if(ck.value){
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
    
    var clickCheckBoxLabel=function(page, name, v){
        var checkBoxId;
        page.getAttribute("[name="+name+"][value=" + v + "]", "id", function(err, id){
          checkBoxId = id;
        });
        page.status(function(){
          page.click("label[for="+checkBoxId+"]");;
        })
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'form_binding');
      });
      page.call(done);
    });
    
    
    it("form input test(value before option)", function(done){
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
      
      page.getValue("[name=desc]", function(err, value){
        assert.strictEqual(value, "aaa\nbbb");
      });
      page.getText("#desc-pre", function(err, text){
        assert.strictEqual(text, "aaa\nbbb");
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
      
      //There is a bug that we cannot handle the automatically generated option events for checkbox/radio
      //we will resolve this issue later but now I have to make the fw workable as soon as possible.
      /*
      page.click("[name=language]");
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "");
      });
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn",
          "bloodType": "AB",
          "sex": "0",
          "language": [],
          "private": true,
          "desc": "aaa\nbbb"
        });
      });
      */
      
      page.addValue("[name=name]", "-added");
      //the name input should has not been synchronized since the default change event is onBlur
      page.getText("#name-pre", function(err, text){
        assert.strictEqual(text, "nnn");
      });
      
      page.addValue("[name=desc]", "\nccc");
      page.getText("#desc-pre", function(err, text){
        assert.strictEqual(text, "aaa\nbbb\nccc");
      });
      //the name input should has been synchronized
      page.getText("#name-pre", function(err, text){
        assert.strictEqual(text, "nnn-added");
      });
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["English"],
          "private": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      
      page.click("#set-option");
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["English"],
          "private": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      page.click("[name=language][value=English]");
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "");
      });
      
      clickCheckBoxLabel(page, "language", "Japanese");
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "Japanese");
      });
      
      clickCheckBoxLabel(page, "language", "Chinese");
      page.getText("#language-pre", function(err, text){
        assert(text.indexOf("Japanese")>=0);
        assert(text.indexOf("Chinese")>=0);
      });
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["Japanese", "Chinese"],
          "private": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      
      page.click("[name=private]");
      page.click("[name=agree]");
     
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["Japanese", "Chinese"],
          "private": false,
          "agree": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      page.call(done);
    });
    
    it("form input test(value after option)", function(done){
      var page = browser.url(url);
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {});
      });
      
      page.click("#set-option");
      
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
      
      page.getValue("[name=desc]", function(err, value){
        assert.strictEqual(value, "aaa\nbbb");
      });
      page.getText("#desc-pre", function(err, text){
        assert.strictEqual(text, "aaa\nbbb");
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
      
      page.click("[name=language]");
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "");
      });
      
      page.addValue("[name=name]", "-added");
      //the name input should has not been synchronized since the default change event is onBlur
      page.getText("#name-pre", function(err, text){
        assert.strictEqual(text, "nnn");
      });
      
      page.addValue("[name=desc]", "\nccc");
      page.getText("#desc-pre", function(err, text){
        assert.strictEqual(text, "aaa\nbbb\nccc");
      });
      //the name input should has been synchronized
      page.getText("#name-pre", function(err, text){
        assert.strictEqual(text, "nnn-added");
      });
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": [],
          "private": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      
      clickCheckBoxLabel(page, "language", "Japanese");
      page.getText("#language-pre", function(err, text){
        assert.strictEqual(text, "Japanese");
      });
      
      clickCheckBoxLabel(page, "language", "Chinese");
      page.getText("#language-pre", function(err, text){
        assert(text.indexOf("Japanese")>=0);
        assert(text.indexOf("Chinese")>=0);
      });
      
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["Japanese", "Chinese"],
          "private": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      
      page.click("[name=private]");
      page.click("[name=agree]");
     
      page.click("#confirm-value");
      page.getText("#confirm-value-pre", function(err, text){
        var obj = JSON.parse(text);
        assert.deepEqual(obj, {
          "name": "nnn-added",
          "bloodType": "AB",
          "sex": "0",
          "language": ["Japanese", "Chinese"],
          "private": false,
          "agree": true,
          "desc": "aaa\nbbb\nccc"
        });
      });
      page.call(done);
    });
    
    
    
});