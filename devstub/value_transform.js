$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.caledData = {
      div: null,
      add: null
    };

    $scope.snippet("body").bind($scope.data, {
      _value: [
        Aj.form({name: "value"}).asInt(),
        {
          _selector: "#prev",
          _transform: function(v){
            return "t:" + v;
          }
        }
      ]
    }).bind($scope.caledData, {
      div: "#div-caled",
      add: "#add-caled",
    });
    
    $scope.observe($scope.data, {
      _value: {
        _on_change: function(newValue, oldValue){
          $scope.caledData.div = newValue / 2;
          $scope.caledData.add = newValue + 1;
        }
      }
    });


  });

});
