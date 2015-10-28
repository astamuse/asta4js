$(function(){

  Aj.init(function($scope){
    console.log($scope);
    
    $scope.data = {};
    
    $scope.snippet("body")
          .bind($scope.data, {
            border: "#target-table@>[border=]",
            width: "#target-table@>[style:width=]",
            color: "#target-table@>[class:(blue|red)?]",
            height: "#target-table@>[class:height40?]",
            checked: "#check-box@>[checked?]",
            enabled:  [
              "#check-box@>[:not(disabled)?]",
              "#check-box@>[class:not(hidden)?]"
            ]
          }).bind("#set-value", "click", function(){
            var v = $("#data-input").val();
            $scope.data = JSON.parse(v);
            console.log($scope.data);
            Aj.sync();
          });
    
  });

});

/*
var reg = /^\[(.+)=\]$/;
var op = "[border=]";
var matchResult = reg.exec(op);
console.log(matchResult);
*/
