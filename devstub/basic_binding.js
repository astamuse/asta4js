$(function(){

  Aj.init(function($scope){
    console.log($scope);
    
    $scope.data = {};
    $scope.snippet("body")
          .bind($scope.data, {
            value:[
              //2 way on input
              {
                _selector: "[name=input1]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _register_assign: function(target, onChange){
                  target.keyup(function(){
                    var v = $(this).val();
                    onChange(v);
                    Platform.performMicrotaskCheckpoint();
                  });
                }
              },
              //2 way on input
              {
                _selector: "[name=input2]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _register_assign: function(target, onChange){
                  target.keyup(function(){
                    var v = $(this).val();
                    onChange(v);
                    Platform.performMicrotaskCheckpoint();
                  });
                }
              },
              //1 way
              "#preview",
            ],
            sub: {
              rr: ".x-recursive-value"
            }
          });
  });

});