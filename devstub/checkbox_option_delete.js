$(function () {
  Aj.init(function ($scope) {
    $scope.data = {
      
    };
    $scope.optionData = {
      sample : ["a","b","c"]
    };
    $scope.snippet("body").bind($scope.data, {
      value : Aj.form("sampleForCheckbox").withOption($scope.optionData, "sample", "#sample-ck-grp")
    }).bind(".x-remove", "click", function(){
      $scope.optionData.sample.splice(1,1);
    });
  });
});

