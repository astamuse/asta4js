$(function(){

  Aj.init(function($scope){
    console.log($scope);
    
    $scope.data = {
      sub: {
        rr: "rrr-haha"
      }
    };
    $scope.snippet("body")
          .bind($scope.data, {
            value:[
              //2 way on input
              {
                _selector: "[name=input1]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _register_on_dom_change : function(target, changeHandler){
                  target.keyup(function(){
                    var v = $(this).val();
                    changeHandler($scope, v);
                  });
                }
              },
              //2 way on input
              {
                _selector: "[name=input2]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _register_on_dom_change: function(target, changeHandler){
                  target.keyup(function(){
                    var v = $(this).val();
                    changeHandler($scope, v);
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
    /*
    $scope.observe($scope.data, {
      values : {
        _splice: function(){},
        _value: function(){},
        _item: {
          _index: function(){},
        }
      }
    });
    */
    
  });

});