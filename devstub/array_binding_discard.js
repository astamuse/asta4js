$(function () {

  Aj.init(function ($scope) {
    $scope.data = {
      list : []
    };
    
    $scope.snippet("body").bind($scope.data, {
      list: {
        _duplicator: ".row",
        _item:{
          _value : {
            _duplicator: ".sub-row",
            _item: {
              _value: [
                "li",
                {
                  _selector: "li",
                  _debug : "sub row binding"
                }
              ]
            },
          }
        },
        _debug: "row binding"
      }
    }).bind("button", "click", function(){
      $scope.data.list = JSON.parse($("#value-input").val());
    });
    
  });
});
