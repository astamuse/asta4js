$(function () {
  Aj.init(function ($scope) {
    $scope.data = {};
    $scope.option = {
      option:[
        "xx",
        "yy"
      ]
    };
    $scope.snippet("body").bind($scope.data,{
      sv1: [Aj.form().withOption($scope.option, "option"), "#sprev1"],
      sv2: [Aj.form().withOption($scope.option, "option"), "#sprev2"],
    });
  });
});
