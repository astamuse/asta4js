$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.observeData = {
      list: []
    };

    $scope.observe($scope.data, {
      value: function(newValue, oldValue){
        $scope.observeData.value = newValue + "-observed";
      },
      list: {
        _array_map: function(newValue, oldValue){
          var list = $scope.observeData.list;
          var hopeLength = Array.isArray(newValue) ? newValue.length : 0;
          Aj.util.arrayLengthAdjust(list, hopeLength, function(){//initialize new item
            return "";
          }, function(){//discard mapped array
            list = [];
          });
          return list;
        },
        _item: {
          _value: function(newValue, oldValue, bindContext){
            var targetIndex = bindContext._getArrayIndex();
            $scope.observeData.list[targetIndex] = $scope.data.list[targetIndex] + "-observed-changed";
          }
        }
      }
    });
    
    $scope.snippet("body").bind($scope.data, {
      value: [
        ".x-value",
        Aj.form({selector: "#value-input"}, null, ["keyup"])
      ],
      list : {
        _duplicator : "li.row",
        _item : [
          //2 way on input
          {
            _selector : "[name=input]",
            _render : function (target, newValue, oldValue) {
              target.val(newValue);
            },
            _register_dom_change : function(target, changeHandler, bindContext){
              target.keyup(function(){
                var v = $(this).val();
                changeHandler(v, bindContext);
              });
              return function(){
                changeHandler(target.val(), bindContext);
              }
            }
          },
          //1 way
          "#preview",
          //binding _index
          {
            _index : [".x-index", ".x-func@>[aIndex=]"]
          }
        ],
        length : ".x-length"
      }
    })
    .bind($scope.observeData, {
      value: ".x-value-ob",
      list : {
        _duplicator : "li.row-ob",
        _item : [
          //1 way
          "#preview-ob",
          //binding _index
          {
            _index : ".x-index-ob"
          }
        ],
        length : ".x-length-ob"
      }
    })
    .on("click", ".x-add", function () {
      var currentIndex = parseInt($(this).attr("aIndex"));
      $scope.data.list.splice(currentIndex + 1, 0, "added value" + new Date());
      setTimeout(function(){
        console.log("console.log($scope.data.list):", $scope.data.list);
      });
    })
    .on("click", ".x-remove", function () {
      var currentIndex = parseInt($(this).attr("aIndex"));
      $scope.data.list.splice(currentIndex, 1);
    })
    .on("click", ".x-go-up", function () {
      var currentIndex = parseInt($(this).attr("aIndex"));
      if (currentIndex > 0) {
        Aj.util.arraySwap($scope.data.list, currentIndex, currentIndex - 1);
      }
    })
    .on("click", ".x-go-down", function () {
      var currentIndex = parseInt($(this).attr("aIndex"));
      if (currentIndex < $scope.data.list.length - 1) {
        Aj.util.arraySwap($scope.data.list, currentIndex, currentIndex + 1);
      }
    }).bind("#set-list-value", "click", function () {
      var v = $("#list-data-input").val();
      var list = v.split("\n");
      $scope.data.list = list;
      console.log($scope.data.list);
      Aj.sync();
    });

  });

});
