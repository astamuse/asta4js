var assert = require('assert');

var sleep = require('sleep');

describe('tree bind', function() {
    
    var url = 'http://localhost:9001/devstub/tree.html';
    
    //to simplify the test data structure, an array following to a string means the children of 
    //the previous string value node
    var confirmItemValue = function(page, values, parentXPath){
      if(!parentXPath){
        confirmItemValue(page, values, "//body/ul[@class='x-tree']")
        confirmItemValue(page, values, "//body/ul[@class='x-tree-fn-meta']")
        return;
      }
      //console.log("confirm under:", parentXPath);
      var p = 0;
      for(var i=0;i<values.length;i++){
        if(!Array.isArray(values[i])){
          p++;
        }
        (function(idx, pos){
          var path = parentXPath + "/li[@class='x-row'][position()=" + pos + "]";
          if(Array.isArray(values[idx])){
            path += "/div/ul";
            confirmItemValue(page, values[idx], path);
          }else{
            path += "/label";
            page.getText(path, function(err, text){
              //console.log("assert ", path, "text", text);
              assert.strictEqual(text, values[idx])
            });
          }
        })(i, p);
      }
      //console.log("nonArrayCount", p, "parentXPath", parentXPath);
      page.elements(parentXPath + "/li[@class='x-row']", function(err, res){
        //console.log("nonArrayCount:", p, "parentXPath", parentXPath);
        assert.strictEqual(res.value.length, p);
      });
    }
    
    it("title test", function(done){
      var page = browser.url(url);
      page.getTitle(function(err,title) {
         assert.strictEqual(title,'tree binding');
      });
      page.call(done);
    });
    
    it("action test", function(done){
      var page = browser.url(url);
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
          "dd3",
        ]
      );
      
      page.click("#x-add-top");
      
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
          "dd3",
          "top-1" //added
        ]
      );
      
      page.click("#btn-1.x-add-btn");
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
            [
              "dd2-0" //added
            ],
          "dd3",
          "top-1"
        ]
      );
      
      page.click("#btn-1-0.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-0");
      })
      
      page.click("#btn-1.x-add-btn");
      page.click("#btn-3.x-add-btn");
      page.click("#btn-3.x-add-btn");
      
     
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
            [
              "dd2-0",
              "dd2-1",//added
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",//added
              "top-1-1",//added
            ],
        ]
      );
      
      page.click("#btn-3-1.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "top-1::top-1-1");
      })
      
      page.click("#btn-1.x-add-btn");
      
      page.click("#btn-1-1.x-add-btn");
      page.click("#btn-1-1.x-add-btn");
      page.click("#btn-1-1.x-add-btn");
      page.click("#btn-1-1.x-add-btn");
      
      page.click("#btn-1-2.x-add-btn");
      page.click("#btn-1-2.x-add-btn");
      page.click("#btn-1-2.x-add-btn");
      
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
            [
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",//added
                  "dd2-1-1",//added
                  "dd2-1-2",//added
                  "dd2-1-3",//added
                ],
              "dd2-2",//added
                [
                  "dd2-2-0",//added
                  "dd2-2-1",//added
                  "dd2-2-2",//added
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
        ]
      );
      
      page.click("#btn-1-1-3.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-1::dd2-1-3");
      })
      
      page.click("#btn-1-2.x-up-btn");
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
            [
              "dd2-0",
              "dd2-2",//moved up
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
        ]
      );
      
      page.click("#btn-1-1-2.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-2::dd2-2-2");
      })
      
      page.click("#btn-1-1.x-up-btn");
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
            [
              "dd2-2",//moved up
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
        ]
      );
      
      page.click("#btn-0.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd1",//moved down
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
        ]
      );
      
      page.click("#btn-0-0-2.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-2::dd2-2-2");
      })
      
      page.click("#btn-0-1.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-0");
      })
      
      page.click("#btn-1.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd1");
      })
      
      page.click("#btn-1.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "dd1",//moved down
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
        ]
      );
      
      page.click("#btn-2.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
          "dd1",//moved down
        ]
      );
      
      page.click("#btn-3.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
          "dd1",//try to move down but nothing changed
        ]
      );
      
      page.click("#btn-0.x-up-btn");
      confirmItemValue(page,
        [
          "dd2",//try to move up but nothing changed
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "dd3",
          "top-1",
            [
              "top-1-0",
              "top-1-1",
            ],
          "dd1",
        ]
      );
      
      page.click("#btn-2.x-up-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "top-1",//moved up
            [
              "top-1-0",
              "top-1-1",
            ],
          "dd3",
          "dd1",
        ]
      );
      
      page.click("#btn-1-0.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-0",
                  "dd2-2-1",
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                  "dd2-1-3",
                ],
            ],
          "top-1",
            [
              "top-1-1",
              "top-1-0",//moved down
            ],
          "dd3",
          "dd1",
        ]
      );
      
      page.click("#btn-0-0-0.x-down-btn");
      page.click("#btn-0-2-2.x-down-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-1",
                  "dd2-2-0", //moved down
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-3",
                  "dd2-1-2",//moved down
                ],
            ],
          "top-1",
            [
              "top-1-1",
              "top-1-0",
            ],
          "dd3",
          "dd1",
        ]
      );
      
      page.click("#btn-0-2-2.x-remove-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              "dd2-2",
                [
                  "dd2-2-1",
                  "dd2-2-0", 
                  "dd2-2-2",
                ],
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  //"dd2-1-3", removed
                  "dd2-1-2",
                ],
            ],
          "top-1",
            [
              "top-1-1",
              "top-1-0",
            ],
          "dd3",
          "dd1",
        ]
      );
      
      page.click("#btn-0-2-2.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2::dd2-1::dd2-1-2");
      })
      
      page.click("#btn-0-0.x-remove-btn");
      confirmItemValue(page,
        [
          "dd2",
            [
              /*  removed
              "dd2-2",
                [
                  "dd2-2-1",
                  "dd2-2-0", 
                  "dd2-2-2",
                ],
              */
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                ],
            ],
          "top-1",
            [
              "top-1-1",
              "top-1-0",
            ],
          "dd3",
          "dd1",
        ]
      );
      
      page.click("#btn-0.x-remove-btn");
      page.click("#btn-1.x-remove-btn");
      confirmItemValue(page,
        [
          /* removed
          "dd2",
            [
              "dd2-0",
              "dd2-1",
                [
                  "dd2-1-0",
                  "dd2-1-1",
                  "dd2-1-2",
                ],
            ],
          */ 
          "top-1",
            [
              "top-1-1",
              "top-1-0",
            ],
          //"dd3", removed
          "dd1",
        ]
      );
      
      page.click("#btn-0-0.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "top-1::top-1-1");
      })
      
      page.click("#btn-0.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "top-1");
      })
      
      page.click("#btn-1.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd1");
      })
      
     
      page.click("#x-reset-value");
      
      confirmItemValue(page,
        [
          "dd1",
          "dd2",
          "dd3",
        ]
      );
      
      page.click("#btn-0.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd1");
      })
      
      page.click("#btn-1.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd2");
      })
      
      page.click("#btn-2.x-node-info-btn");
      page.getText("#x-node-context-info", function(err, text){
        assert.strictEqual(text, "dd3");
      })
      
      
     
      page.call(done);
    });
    

    

    
});