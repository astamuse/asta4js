$(function () {
  Aj.init(function ($scope) {
    $scope.data = {};
    $scope.snippet("body").bind($scope.data,{
      file: Aj.form()
    });
  });
});
