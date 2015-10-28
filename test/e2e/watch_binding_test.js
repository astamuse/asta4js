var assert = require('assert');

describe('watch binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/watch_binding.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'watch_binding');
      });
      page.call(done);
    });
    
    it("watch test", function(done){
      var page = browser.url(url);
      
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'undefined-undefined-undefined:undefined');
      });
      page.getText(".x-watch-year-str", function(err, text){
        assert.strictEqual(text,'wy:undefined');
      });
      
      page.setValue("[name=year]", "y");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'y-undefined-undefined:undefined');
      });
      page.getText(".x-watch-year-str", function(err, text){
        assert.strictEqual(text,'wy:y');
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
      
      page.setValue("[name=year]", "xxy");
      page.getText(".x-date-str", function(err, text){
        assert.strictEqual(text,'xxy-m-d:bbb');
      });
      page.getText(".x-watch-year-str", function(err, text){
        assert.strictEqual(text,'wy:xxy');
      });
      
      page.call(done);
    });
    
    
});