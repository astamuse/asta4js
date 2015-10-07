$(function () {

  Aj.init(function ($scope) {
    
    $scope.snippet("body").bind(Aj.refPath("data.nest"), {
      simpleValue: "#simplevalue"
    }).bind(Aj.refPath("data.map.x"), {
      _selector: "#xvalue"
    }).bind(Aj.refPath("data.map.list"), {
      _duplicator: "li",
      _item: "li"
    });
    
    $scope.data = {
      nest: {
        simpleValue: "simple value here",
      },
      map:{
        x: "x value here",
        list: [1, 2, 3]
      }
    };
    
    Aj.sync();

  });

});
