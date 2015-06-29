$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {

    };

    $scope.snippet("body").bind($scope.data, {
      "@v":[
        {
          _virtual: true,
          _value_ref: ".x-add"
        },
        {
          _virtual: true,
          _selector: ".x-show"
        },
        {
          _selector: ".x-show-direct"
        }
      ]
    }).bind(".x-add", "click", function(){
      var ref = Aj.getValueRef(this);
      var v = ref.getValue();
      if(!v){
        v = 0;
      }
      v++;
      ref.setValue(v);
    });
    

  });

});
