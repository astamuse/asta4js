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
    
    var treeClone = document.importNode($(".x-tree")[0], true);
    var treeMeta ={
      _duplicator: "li",
      _item: {
        _context: "a.btn",
        _value: {
          _selector: ".x-child-tree-root",
          _render: function(target, newValue, oldValue, bindContext){
            //we have to delay the children binding due to avoiding the ".x-name" 
            //to be propagated to the child tree
            if(bindContext.childNodesScopeRef){
              bindContext.childNodesScopeRef.currentNode = newValue;
            }else{
              Aj.delay(function(){
                target.find(".x-tree").remove();
                if(newValue){
                  var clone = document.importNode(treeClone, true);
                  target.append(clone);
                  bindContext.asBackground(function(){
                    Aj.init(function(_scope){
                      bindContext.childNodesScopeRef = _scope;
                      _scope.currentNode = newValue;
                      _scope.snippet($(clone)).bind(_scope.currentNode, {
                        nodes: treeMeta
                      });
                    });
                  });
                }
              });
            }
          } // _render
        },// _value,
        title: ".x-title",
        nodes:{
          length: {
            _selector: ".x-toggle-btn@>[style:display=]",
            _transform: function(v){
              return v ? "" : "none";
            }
          }
        }
      },
    };
     
    $scope.snippet(".x-tree").bind($scope.data, {
      tree:treeMeta
    }).on("click", ".x-remove-btn", function(){
      Aj.arrayUtil.commonEventTask.remove(this);
    }).on("click", ".x-add-btn", function(){
      var context = Aj.getContext(this);
      var item = context.getItem();
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
