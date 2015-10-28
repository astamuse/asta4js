$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.data2 = {};
    
    var keyupInput = function(){
      return {
        _form:{
          _extra_change_events: ["keyup"]
        }
      }
    };
    
    $scope.snippet("body").bind($scope.data, {
      year : keyupInput(),
      month :keyupInput(),
      day : keyupInput(),
      "date-str": {
        _selector: ".x-date-str",
        _watch: {
          _fields: ["year", "month", "day", "@:data2.babe"],
          _cal: function(y, m, d, b){
            return y + "-" + m + "-" + d + ":" + b;
          }
        }
      },
      "watch-year-str": {
        _selector: ".x-watch-year-str",
        _watch: {
          _fields: ["year"]
        },
        _render: function(target, values){
          if(values){
            target.text("wy:" + values[0]);
          }else{
            target.text("wy:");
          }
          
        }
      }
    }).bind($scope.data2,{
      babe: keyupInput()
    });


  });

});
