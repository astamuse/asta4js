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
        },
        {
          value: "e"
        }
      ]
    };
    
    $scope.data = Aj.util.clone(data);
    
    var setError = function(){
      Aj.delay(function(){
        $scope.data.error = Aj.__internal__.Observe.Observer._errorThrownDuringCallback;
      }, 0, 5);
    }

    $scope.snippet("body").bind($scope.data, {
      list:{
        _duplicator: "li",
        _item: {
          _context: ".x-remove",
          _index: [".x-index", ".x-idx-attr@>[index=]"],
          value: ".x-value",
          "@vp":{
            _virtual: true,
            _value_ref: ".x-inc",
            a: ".x-vp-a",
            b: ".x-vp-b"
          },
        }
      },
      error: ".x-err"
    }).on("click", ".x-inc", function(){
      var ref = Aj.getValueRef(this);
      var v = ref.getValue();
      if(!v){
        v = {
          a: 0,
          b: 0
        }
      }
      v.a = v.a + 1;
      v.b = v.a * 10;
      ref.setValue(v);
      setError();
    }).on("click", ".x-remove", function(){
      var assistant = Aj.getContext(this).getArrayAssistant();
      assistant.remove();
      setError();
    }).bind(".x-reset", "click", function(){
      $scope.data = Aj.util.clone(data);
      inrem_idx = 0;
      setError();
    }).bind(".x-inrem", "click", function(){
      $scope.data.list.splice(3, 1, {value: "in+" + (inrem_idx++)}, {value: "in+" + (inrem_idx++)});
      $scope.data.list.splice(1, 1, {value: "in+" + (inrem_idx++)}, {value: "in+" + (inrem_idx++)});
      setError();
    }).bind(".x-ins", "click", function(){
      Array.prototype.push.apply($scope.data.list, data.list);
      setError();
    }).bind(".x-rem", "click", function(){
      var len = $scope.data.list.length;
      $scope.data.list.splice(0, len);
      setError();
    });
  });

        
  var inrem_idx = 0;
  
});
