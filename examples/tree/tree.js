$(function () {

  Aj.init(function ($scope) {
    
    var initTreeData = function(){
      $.ajax({
        type: "get",
        url: "data.json",
      }).done(function(data){
        $scope.data.tree = data;
      }).fail(function(jqXHR, textStatus, errorThrown ){
        //fallback
        $scope.data.tree = [];
      });
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
                Aj.init(function(_scope){
                  console.log(newValue.name, " children ajed ", ++ajcount);
                  _scope.ajcount = ajcount;
                  _scope.item = newValue;
                  _scope.snippet($(clone)).bind(_scope.item, {
                    children: treeMeta
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
    }).on("unload", "li", function(){
      console.log("unloading", this);
    });
    
    $("#x-reset-value").click(function(){
      initTreeData();
    });
    
    $("#x-set-value").click(function(){
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
      
    //treeMeta._item.children = treeMeta;
    


    
  });

});
