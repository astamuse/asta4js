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
                _register_dom_change : function(scope, propertyPath, snippet, selector, changeHandler){
                  var target = snippet.find(selector);
                  var observePath = Path.get(propertyPath);
                  var passToHandler = {
                    setValue: function(v){
                      observePath.setValueFrom(scope, v);
                    }
                  };
                  target.keyup(function(){
                    var v = $(this).val();
                    changeHandler(passToHandler, v);
                  });
                  return function(){
                    changeHandler(passToHandler, target.val());
                  };
                }
              },
              //2 way on input
              {
                _selector: "[name=input2]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _register_dom_change : function(scope, propertyPath, snippet, selector, changeHandler){
                  var target = snippet.find(selector);
                  var observePath = Path.get(propertyPath);
                  var passToHandler = {
                    observePath: observePath,
                    scope: scope
                  };
                  target.keyup(function(){
                    var v = $(this).val();
                    changeHandler(passToHandler, v);
                  });
                  return function(){
                    changeHandler(passToHandler, target.val());
                  }
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