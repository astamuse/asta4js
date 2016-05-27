$(function () {

  Aj.init(function ($scope) {
    $scope.data = {
      verify: "",
      list: ["row-1", "row-2"]
    };
    
    $scope.snippet("body")
      .bind($scope.data, {
        verify: ".x-verify",
        list : {
          _duplicator : ".x-row",
          _item : {
            _index: {
              _selector: ".x-btn",
              _render:function(target, v){
                target.attr("id", "btn-" + v);
              }
            },
            _selector: ".x-name",
            _context: ".x-btn"
          }
        }
      })
      .on("click", ".x-btn", function () {
        var assistant = Aj.getContext(this).getArrayAssistant();
        var item = assistant.getItem();
        $scope.data.verify = item;
      })

  });

});
