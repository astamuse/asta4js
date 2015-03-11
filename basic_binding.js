$(function(){

  Aj.init(function($scope){
    console.log($scope);
    
    $scope.data = {};
    $scope.snippet("body")
          .bind($scope.data, {
            value:[
              {
                _selector: "[name=input1]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _assign: function(scope, propertyPath, value){
                  Path.get(propertyPath).setValueFrom(scope, value);
                },
                _register_render: function(scope, propertyPath, onChange){
                  console.log("monitor:" + propertyPath);
                  var observer = new PathObserver(scope, propertyPath);
                  observer.open(function(newValue, oldValue){
                    console.log(propertyPath + " changed from " + oldValue + " to " + newValue);
                    onChange(newValue, oldValue);
                  });
                },
                _register_assign: function(target, onChange){
                  console.log("dom change register:");
                  console.log(target);
                  
                  target.keyup(function(){
                    console.log("dom onchange:");
                    console.log(target);
                    var v = $(this).val();
                    onChange(v);
                  });
                }
              },
              {
                _selector: "[name=input2]",
                _render: function(target, newValue, oldValue){
                  target.val(newValue);
                },
                _assign: function(scope, propertyPath, value){
                  Path.get(propertyPath).setValueFrom(scope, value);
                },
                _register_render: function(scope, propertyPath, onChange){
                  var observer = new PathObserver(scope, propertyPath);
                  observer.open(function(newValue, oldValue){
                    onChange(newValue, oldValue);
                  });
                },
                _register_assign: function(target, onChange){
                  target.keyup(function(){
                    var v = $(this).val();
                    onChange(v);
                  });
                }
              },
              { 
                _selector: "#preview",
                _render: function(target, newValue, oldValue){
                  target.text(newValue);
                },
                _assign: null,
                _register_render: function(scope, propertyPath, onChange){
                  var observer = new PathObserver(scope, propertyPath);
                  observer.open(function(newValue, oldValue){
                    onChange(newValue, oldValue);
                  });
                },
                _register_assign: null
              }
            ]
          });
    
  });

});