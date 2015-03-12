$(function(){

  Aj.init(function($scope){
    console.log($scope);
    
    $scope.data = {};
    $scope.snippet("body")
          .bind($scope.data, {
            list: {
              _duplicator: "li",
              _value:[
                //2 way on input
                {
                  _selector: "[name=input]",
                  _render: function(target, newValue, oldValue){
                    target.val(newValue);
                  },
                  _register_assign: function(target, onChange){
                    target.keyup(function(){
                      var v = $(this).val();
                      onChange(v);
                    });
                  }
                },
                //1 way
                "#preview",
              ]
            }
          });
    
    $("#set-value").click(function(){
      var v = $("#data-input").val();
      var list = v.split("\n");
      $scope.data.list = list;
      console.log($scope.data.list);
      Platform.performMicrotaskCheckpoint();
    });
    
  });

});