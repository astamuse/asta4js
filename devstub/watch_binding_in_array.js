$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = [
      {
        any: "aaa"
      },
      {
        any: "bbb"
      },
      {
        any: "ccc"
      },
      {
        any: "ddd"
      }
    ]
    
    var keyupInput = function(){
      return {
        _form:{
          _extra_change_events: ["keyup"]
        }
      }
    };
    
    $scope.snippet("ul").bind($scope.data, {
      _duplicator: "li",
      _item: {
        _context: ".x-remove",
        any: keyupInput(),
        "@watch": {
          _selector: ".x-watch",
          _watch: {
            _fields: ["any"],
            _cal: function(v){
              return v+"-watched";
            }
          }
        }
      }
    }).bind(".x-remove", "click", function(){
      var ss = $scope;
      Aj.getContext(this).getArrayAssistant().remove();
    });


  });

});
