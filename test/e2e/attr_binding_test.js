var assert = require('assert');

describe('attr binding tests', function() {
    
    var url = 'http://localhost:9001/devstub/attr_binding.html';
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'attr_binding');
      });
      page.call(done);
    });
    
    it("set attr test", function(done){
      var page = browser.url(url);
      page.click("#set-value");
      page.getAttribute("#target-table", "border", function(err, attr){
        assert.strictEqual(attr,'1');
      });
      page.getAttribute("#target-table", "style", function(err, style){
        assert.strictEqual(style,'width: 30%;');
      });
      page.getAttribute("#target-table", "class", function(err, cls){
        var all = cls.split(" ");
        assert.equal(all.indexOf("blue") >=0, true);
        assert.equal(all.indexOf("height40") >=0, true);
      });
      page.getAttribute("#check-box", "checked", function(err, checked){
        assert.equal(Boolean(checked), false);
      });
      page.call(done);
    });
    
});