$(function () {

  Aj.init(function ($scope) {
    $scope.data = {
      list : [11,22,33]
    };
    
    $scope.snippet("body").bind($scope.data, {
      list: {
        _duplicator: ".row",
        _item:{
          _index : {
            _selector: ".x-index",
            _transform: function(v){
              return v + 1;
            }
          },
          _value : ".x-value"
        },
        _debug: "row binding"
      }
    });
    
  });
});
