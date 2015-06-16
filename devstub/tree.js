$(function () {

  Aj.init(function ($scope) {
    
    var initTreeData = function(){
      $scope.data.tree = [
        {
          "name": "dd1"
        },
        {
          "name": "dd2"
        },
        {
          "name": "dd3",
          "children": [
          {
            "name": "nb1",
            "children": [
              {
                "name": "zz"
              },
              {
                "name": "yy(to be removed after modify)"
              },
              {
                "name": "xx",
                "children":[
                  {
                    "name": "fly"
                  }
                ]
              }
            ]
          },
          {
            "name": "nb2"
          },
          {
            "name": "nb3"
          }
          ]
        }
      ];
    };
    
    $scope.data = {
      tree: null
    }; 
    
    initTreeData();
    
    // I am worry about whether there is memory leak...
    // I should dig it in next week. DO NOT FORGET IT!!!
    var treeClone = document.importNode($(".x-tree")[0], true);
    var ajcount = 0;
    var treeMeta ={
      _duplicator: "li",
      _item: {
        _context: ".x-node-button",
        name: [
          ".x-name",
          {
            _selector: ".x-name@>[style:background-color=]",
            _transform: function(v){
              if(v){
                return v.indexOf(":") >= 0 ? "yellow" : "";
              }else{
                return "";
              }
            }
          }
        ],
        _value: {
          _selector: ".x-child-tree",
          _render: function(target, newValue, oldValue, bindContext){
            //we have to delay the children binding due to avoiding the ".x-name" 
            //to be propagated to the child tree
            Aj.delay(function(){
              target.find(".x-tree").remove();
              if(newValue){
                var clone = document.importNode(treeClone, true);
                target.append(clone);
                bindContext.asBackground(function(){
                  Aj.init(function(_scope){
                    console.log(newValue.name, " children ajed ", ++ajcount);
                    _scope.ajcount = ajcount;
                    _scope.item = newValue;
                    _scope.snippet($(clone)).bind(_scope.item, {
                      children: treeMeta
                    });
                  });
                });
              }
            });
          } // _render
        }// _value
      }
    };
     
    $scope.snippet(".x-tree").bind($scope.data, {
      tree:treeMeta
    }).on("click", ".x-node-button", function(){
      var context = Aj.getContext(this);
      var chain = [];
      var backtracking = 0;
      var item = context.getItem(backtracking);
      while(item){
        chain.unshift(item.name);
        backtracking++;
        item = context.getItem(backtracking);
      }
      $("#x-node-context-info").text(chain.join("->"));
    });
    
    $scope.snippet("#x-btns")
      .bind("#x-reset-value", "click", function(){
        initTreeData();
      })
      .bind("#x-set-value", "click", function(){
        $scope.data.tree[1].name = "modified:uu2";
        $scope.data.tree[1].children = [
          {
            name: "added:mm1"
          },
          {
            name: "added:mm2"
          },
        ];
        $scope.data.tree[2].children.push({
          name: "added:mx1"
        });
        $scope.data.tree[2].children.push({
          name: "added:mx2",
          children: [
            {
              name: "added:@@@"
            },
            {
              name: "added:###"
            }
          ]
        });
        
         $scope.data.tree[2].children[0].children.splice(1,1);
         
         $scope.data.tree.push({
           name: "added:top-last"
         });

        Aj.sync();
      });
      
   
  });

});
