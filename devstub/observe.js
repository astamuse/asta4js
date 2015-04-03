$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.observeData = {
    };

    $scope.observe($scope.data, {
      value: function(newValue, oldValue){
        $scope.observeData.value = newValue + "-observed";
      },
      list: {
        _value: function(newValue){
          var len = newValue ? newValue.length : 0;
          var copyArray = new Array(len);
          $scope.observeData.list = copyArray;
        },
        _splice: function(splices){
          splices.forEach(function (s) {
            var diff = s.addedCount - s.removed.length;
            if(diff > 0){
              var callParam = [];
              callParam.push(s.index);
              callParam.push(0);
              for(var i=0;i<diff;i++){
                callParam.push(undefined);
              }
              Array.prototype.splice.apply($scope.observeData.list, callParam);
            }else{
              $scope.observeData.list.splice(s.index, 0-diff);
            }
          });

         
         
        },
        _item: {
          _value: function(newValue, oldValue, bindContext){
            var targetIndex = bindContext._indexes[0];
            $scope.observeData.list[targetIndex] = $scope.data.list[targetIndex] + "-observed-changed";
          }
        }
      }
    });
    
    $scope.snippet("body").bind($scope.data, {
      value: [
        ".x-value",
        Aj.form({selector: "#value-input"}, "keypress")
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
            _index : ".x-index-"
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
    });

    $("#set-list-value").click(function () {
      var v = $("#list-data-input").val();
      var list = v.split("\n");
      $scope.data.list = list;
      console.log($scope.data.list);
      Aj.sync();
    });

  });

});
