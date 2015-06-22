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
     
    $scope.snippet(".x-tree").bind($scope.data, {
      tree:{
        _meta_id: "tree",
        _duplicator: "li",
        _item: {
          _context: "a.btn",
          title: ".x-title",
          nodes: {
            length: {
              _selector: ".x-toggle-btn@>[style:display=]",
              _transform: function(v){
                return v ? "" : "none";
              }
            },
            _nest: {
              _root: ".x-tree",
              _child_root_parent: ".x-child-tree-root",
              _meta_id: "tree"
            }
          },// nodes
        },
      }
    }).on("click", ".x-remove-btn", function(){
      Aj.getContext(this).getArrayAssistant(true).remove();
    }).on("click", ".x-add-btn", function(){
      var assistant = Aj.getContext(this).getArrayAssistant(true);
      var item = assistant.getItem();
      if(!Array.isArray(item.nodes)){
        item.nodes = [];
      }
      item.nodes.push({
        id: item.id * 10 + item.nodes.length,
        title: item.title + "." + (item.nodes.length + 1),
        nodes: []
      });
    }).on("click", ".x-toggle-btn", function(){
      var btn = $(this);
      var targetChildTree = btn.closest("li").find(".x-child-tree-root>ol");
      var icon = btn.find(".x-toggle-icon");
      if(icon.hasClass("glyphicon-chevron-down")){//collapse
        icon.removeClass("glyphicon-chevron-down");
        icon.addClass("glyphicon-chevron-right");
        targetChildTree.css("display", "none");
      }else{//expand
        icon.removeClass("glyphicon-chevron-right");
        icon.addClass("glyphicon-chevron-down");
        targetChildTree.css("display", "");
      }
      
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
