var assert = require('assert');
var testUtil = require("../testUtil");

describe('array binding select tests', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding_selectbox.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'array_binding_selectbox');
      });
      page.call(done);
    });
    
    
    it("selectbox in array", function(done){
      var page = browser.url(url);

      page.selectByValue("select[aindex='0']", "a");
      page.getText(".x-sample-select[aindex='0']", function(err, text){
        assert.strictEqual(text, "a");
      });
      page.getText(".x-sample-select[aindex='1']", function(err, text){
        assert.strictEqual(text, "");
      });
      page.getText(".x-sample-select[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      page.selectByValue("select[aindex='1']", "b");
      page.getText(".x-sample-select[aindex='0']", function(err, text){
        assert.strictEqual(text, "a");
      });
      page.getText(".x-sample-select[aindex='1']", function(err, text){
        assert.strictEqual(text, "b");
      });
      page.getText(".x-sample-select[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      page.selectByValue("select[aindex='2']", "c");
      page.getText(".x-sample-select[aindex='0']", function(err, text){
        assert.strictEqual(text, "a");
      });
      page.getText(".x-sample-select[aindex='1']", function(err, text){
        assert.strictEqual(text, "b");
      });
      page.getText(".x-sample-select[aindex='2']", function(err, text){
        assert.strictEqual(text, "c");
      });
      
      page.selectByValue("select[aindex='0']", "b");
      page.getText(".x-sample-select[aindex='0']", function(err, text){
        assert.strictEqual(text, "b");
      });
      page.getText(".x-sample-select[aindex='1']", function(err, text){
        assert.strictEqual(text, "b");
      });
      page.getText(".x-sample-select[aindex='2']", function(err, text){
        assert.strictEqual(text, "c");
      });

      /*
      page.click("[aindex='0'][value=a]");
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert.strictEqual(text, "a");
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert.strictEqual(text, "");
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='0'][value=b]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert.strictEqual(text, "");
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='1'][value=b]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert.strictEqual(text, "b");
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='1'][value=c]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert(text.indexOf("a")<0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")>=0);
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert.strictEqual(text, "");
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='2'][value=c]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert(text.indexOf("a")<0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")>=0);
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert.strictEqual(text, "c");
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='2'][value=a]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert(text.indexOf("a")<0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")>=0);
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")<0);
        assert(text.indexOf("c")>=0);
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='1'][value=b]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")<0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert.strictEqual(text, "c");
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")<0);
        assert(text.indexOf("c")>=0);
      });
      
      testUtil.clickCheckBoxLabel(page, "[aindex='0'][value=c]")
      page.getText(".x-preview[aindex='0']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")>=0);
        assert(text.indexOf("c")>=0);
      });
      page.getText(".x-preview[aindex='1']", function(err, text){
        assert.strictEqual(text, "c");
      });
      page.getText(".x-preview[aindex='2']", function(err, text){
        assert(text.indexOf("a")>=0);
        assert(text.indexOf("b")<0);
        assert(text.indexOf("c")>=0);
      });
      */

      
      page.call(done);
    });
    
});