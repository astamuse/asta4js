$(function () {

  Aj.init(function ($scope) {
    $scope.data = {
      list : ["a", "b", "c"],
      heightList:[]
    };
    
    $scope.snippet("body").bind($scope.data, {
      list: {
        _duplicator: ".row",
        _item:{
          _value : ":root"
        },
      },
      heightList:{
        _duplicator: ".height-row",
        _item: {
          _value: ":root"
        }
      }
    }).bind("#check", "click", function(){
      $scope.data.heightList = [];
      $("li.row").each(function(idx, elem){
        $scope.data.heightList.push($(elem).css("height"));
      });
    });
    
  });
});
