$(function () {

  Aj.init(function ($scope) {
    
    var initTreeData = function(){
      $.ajax({
        type: "get",
        url: "data2.json",
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
    
    var treeClone = document.importNode($(".x-tree")[0], true);
    var treeMeta ={
      _duplicator: "li",
      _item: {
        title: ".x-title",
        _value: {
          _selector: ".x-child-tree-root",
          _render: function(target, newValue, oldValue, bindContext){
            //we have to delay the children binding due to avoiding the ".x-name" 
            //to be propagated to the child tree
            Aj.delay(function(){
              target.find(".x-tree").remove();
              if(newValue){
                var clone = document.importNode(treeClone, true);
                target.append(clone);
                Aj.init(function(_scope){
                  _scope.currentNode = newValue;
                  _scope.snippet($(clone)).bind(_scope.currentNode, {
                    nodes: treeMeta
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
    });
    
    $scope.snippet("#tree-view")
          .bind(".x-reset-btn", "click", function(){
            initTreeData();
          })
          .bind(".x-add-top-btn", "click", function(){
            if($scope.data.tree === undefined || $scope.data.tree === null){//make sure it is not undefined
              $scope.data.tree = [];
            }
            $scope.data.tree.push({
              id: $scope.data.tree.length + 1,
              title: "node" + ($scope.data.tree.length + 1),
              nodes: []
            });
          });
  });

});
