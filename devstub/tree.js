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
    var treeMeta ={
      _meta_id: "treeMeta",
      _duplicator: "li",
      _item: {
        _context: [".x-node-button", ".x-remove-button"],
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
        children: {
          _nest: {
            _root: ".x-tree",
            _child_root_parent: ".x-child-tree",
            _meta_id: "treeMeta"
          }
        }
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
    }).on("click", ".x-remove-button", function(){
      Aj.arrayUtil.commonEventTask.remove(this);
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
