$(function(){
  Aj.init(function($scope){
    $scope.data = {};
    $scope.snippet("body").bind($scope.data, {
      value: [
        Aj.form({}, null, "keyup"),
        "#value-preview"
      ]
    });

  });//end init
});