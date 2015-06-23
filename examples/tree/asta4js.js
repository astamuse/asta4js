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
    
    $scope.snippet("#tree-view").bind(".x-reset-btn", "click", function(){
      initTreeData();
    }).bind(".x-add-top-btn", "click", function(){
      if($scope.data.tree === undefined || $scope.data.tree === null){//make sure it is not undefined
        $scope.data.tree = [];
      }
      $scope.data.tree.push({
        id: $scope.data.tree.length + 1,
        title: "node" + ($scope.data.tree.length + 1),
        nodes: []
      });
    });
    
    var itemControl = {
      meta: {
        _item: {
          nodes: {
            length: {
              _selector: ".x-toggle-btn@>[style:display=]",
              _transform: function(v){
                return v ? "" : "none";
              }
            },
            "@collapsed" :[
              {
                _virtual: true,
                _value_ref: ".x-toggle-btn"
              },
              {
                _virtual: true
                _selector: ">.x-toggle-icon@>[class:glyphicon-chevron-right|glyphicon-chevron-down]",
                _transform: function(v){
                  return v ? "glyphicon-chevron-right" : "glyphicon-chevron-down"
                }
              },
              {
                _virtual: true,
                _selector: ">.x-child-tree-root>ol@>[style:display=]",
                _transform: function(v){
                  return v ? "none" : ""
                }
              },
            ]//end @collapsed
          }
        }//_item
      },//meta
      handler: function(snippet){
        snippet.on("click", ".x-toggle-btn", function(){
          var ref = Aj.getValueRef(this);
          ref.setValue(!ref.getValue());
        });
      }
    }
    
    var itemOp = {
      meta: {
        _item: {
          _context: "a.btn"
        },
      },
      handler: function(snippet){
        snippet.on("click", ".x-remove-btn", function(){
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
        })
      }
    }
     
    $scope.snippet(".x-tree").bind($scope.data, {
      tree:{
        _meta_id: "tree",
        _duplicator: "li",
        _merge: [itemControl.meta, itemOp.meta]
        _item: {
          title: ".x-title",
          nodes: {
            _nest: {
              _root: ".x-tree",
              _child_root_parent: ".x-child-tree-root",
              _meta_id: "tree"
            }
          },// nodes
        },
      }
    }).engage(itemOp.handler)
      .engage(itemControl.handler);
  });
});
