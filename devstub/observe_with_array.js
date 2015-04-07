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
          var removedCount = 0;
          var addedCount = 0;

          splices.forEach(function (s) {
            removedCount += s.removed.length;
            addedCount += s.addedCount;
          });

          var diff = addedCount - removedCount;
          var len = $scope.observeData.list.length;
          if(diff >0){
            var callParam=[];
            callParam.push(len-1);
            callParam.push(0);
            for(var i=0;i<diff;i++){
              callParam.push(undefined);
            }
            Array.prototype.splice.apply($scope.observeData.list, callParam);
          }else if(diff<0){
            diff = 0-diff;
            $scope.observeData.list.splice(len-diff-1, diff);
          }
        },
        //we do not need to handle splice because the following assign will splice our target array automatically
        _item: {
          _value: function(newValue, oldValue, bindContext){
            var targetIndex = bindContext._indexes[0];
            Aj.delay(function(){
              var len = $scope.observeData.list.length;
              if(targetIndex<len){
                $scope.observeData.list[targetIndex] = $scope.data.list[targetIndex] + "-observed-changed" + (new Date());
              }
            });
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
