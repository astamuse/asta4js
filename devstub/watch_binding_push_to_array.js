$(function () {

  Aj.init(function ($scope) {

    $scope.data = {
      list: []
    };
    
    /*
    Aj.delay(function(){
      $.each([100], function(idx, i){
          $scope.data.list.push({
            name: "name-" + i
          });
      });
    }, 10);
    */
    
    /*
    Aj.delay(function(){
      $.each([200], function(idx, i){
          $scope.data.list.push({
            name: "name-" + i
          });
      });
      $scope.data.list[0].name="ff";
    }, 10);
    */
    
    $scope.snippet("ul").bind($scope.data, {
      list:{
        _duplicator: "li",
        _item: {
          "nnn": {
            _selector: ".x-watch",
            _watch: {
              _fields: ["name"],
              _cal: function(v){
                console.log("cal", v);
                return v+"-watched";
              }
            },
            _render: function(target, nv, ov, ctx){
              console.log("args", arguments);
              console.log("idx:", ctx.getArrayAssistant().getIndex());
              target.text(nv);
            }
          }
        }
      }
    });
    

    
      $.each([100], function(idx, i){
          //$scope.data.list = Aj.util.clone($scope.data.list);
          $scope.data.list.push({
            name: "name-" + i
          });
      });

  });

});
