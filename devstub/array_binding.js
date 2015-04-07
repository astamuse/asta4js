$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.snippet("body").bind($scope.data, {
      list : {
        _duplicator : "li",
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

    $("#set-value").click(function () {
      var v = $("#data-input").val();
      var list = v.split("\n");
      $scope.data.list = list;
      console.log($scope.data.list);
      Aj.sync();
    });

  });

});
