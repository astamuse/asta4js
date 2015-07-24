$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    var data = {
      list: [
        {
          value: "a"
        },
        {
          value: "b"
        },
        {
          value: "c"
        },
        {
          value: "d"
        }
      ]
    };
    
    $scope.data = Aj.util.clone(data);

    $scope.snippet("body").bind($scope.data, {
      list:{
        _duplicator: "li",
        _item: {
          _context: ".x-remove",
          _index: ".x-index",
          value: ".x-value",
          "@vp":[
            {
              _virtual: true,
              _value_ref: ".x-inc"
            },
            {
              _virtual: true,
              _selector: ".x-vp"
            },
          ]
        }
      }
    }).bind(".x-inc", "click", function(){
      var ref = Aj.getValueRef(this);
      var v = ref.getValue();
      if(!v){
        v = 0;
      }
      v++;
      ref.setValue(v);
    }).bind(".x-remove", "click", function(){
      var assistant = Aj.getContext(this).getArrayAssistant();
      assistant.remove();
    }).bind(".x-reset", "click", function(){
      $scope.data = Aj.util.clone(data);
    });
  });

});
