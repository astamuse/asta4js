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
          "children": []
        }
      ];
    };
    
    $scope.data = {
      tree: null
    }; 
    
    initTreeData();
    
    $scope.snippet(".x-tree").bind($scope.data, {
      tree:{
        _meta_id: "treeMeta",
        _duplicator: "li",
        _item: {
          _context: [
            ".x-btn",
            {
              _selector: ".x-btn",
              _render: function(target, newValue){
                var assistant = newValue.getArrayAssistant();
                var indexes = assistant.getIndexes();
                target.attr("id", "btn-"+indexes.join("-"));
              }
            }
          ],
          name: ".x-name",
          children: {
            _nest: {
              _root: ".x-tree",
              _child_root_parent: ".x-child-tree",
              _meta_id: "treeMeta"
            }
          }
        }
      }
    }).on("click", ".x-node-info-btn", function(){
      var assistant = Aj.getContext(this).assistant(true);
      var chain = [];
      var backtracking = 0;
      var item = assistant.getItem(backtracking);
      while(item){
        chain.unshift(item.name);
        backtracking++;
        item = assistant.getItem(backtracking);
      }
      $("#x-node-context-info").text(chain.join("->"));
    }).on("click", ".x-add-btn", function(){
      var assistant = Aj.getContext(this).getArrayAssistant(true);
      var item = assistant.getItem();
      if(!Array.isArray(item.children)){
        item.children = [];
      }
      item.children.push({
        name: item.name + "-" + item.children.length,
        children: []
      });
    }).on("click", ".x-remove-btn", function(){
      Aj.getContext(this).getArrayAssistant(true).remove();
    }).on("click", ".x-up-btn", function(){
      Aj.getContext(this).getArrayAssistant(true).moveUp();
    }).on("click", ".x-down-btn", function(){
      Aj.getContext(this).getArrayAssistant(true).moveDown();
    });
    
    var topCounter = 0;
    
    $scope.snippet("#x-btns").bind("#x-reset-value", "click", function(){
      initTreeData();
    }).bind("#x-add-top", "click", function(){
      $scope.data.tree.push({
        name: "top-" + (++topCounter),
        children: []
      });
    });
      
   
  });

});
