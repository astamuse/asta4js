$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};

    $scope.snippet("body").bind($scope.data, {
      name : [
      "#name-pre",
      {
        _form : "name"
      }],
      desc : [
      "#desc-pre",
      {
        _form : {
          name : "desc",
          _extra_change_events : ["keyup"]
        }
      }]
    });
    
    $("#confirm-value").click(function(){
      $("#confirm-value-pre").text(JSON.stringify($scope.data));
    });
  });

});