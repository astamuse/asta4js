var assert = require('assert');
var testUtil = require("../testUtil");

describe('array binding checkbox tests', function() {
    
    var url = 'http://localhost:9001/devstub/array_binding_checkbox.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'array_binding_checkbox');
      });
      page.call(done);
    });
    
    
    it("checkbox in array test", function(done){
      var page = browser.url(url);

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

      
      page.call(done);
    });
    
});