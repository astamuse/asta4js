(function() {
  'use strict';

  angular.module('treeApp', ['ui.tree'])
  .controller('treeCtrl', ['$scope', '$http', function($scope, $http) {
    
    $scope.initData = function(){
      $http.get("data.json")
            .success(function(data){
              $scope.data = data;
            });
    };
    
    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      if(nodeData === undefined){//add to the total level of tree
        $scope.data.push({
          id: $scope.data.length + 1,
          title: "node" + ($scope.data.length + 1),
          nodes: []
        });
      }else{
        nodeData.nodes.push({
          id: nodeData.id * 10 + nodeData.nodes.length,
          title: nodeData.title + '.' + (nodeData.nodes.length + 1),
          nodes: []
        });
      }
    };
    
    $scope.initData();
    
  }]);

})();