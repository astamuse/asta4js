$(function(){
  //a help function to wrap the binding of brick calendar component
  var BrickCalendar = function(selector){
    return {
      _selector: selector,
      _render:function(target, newValue, oldValue){
        target.prop("chosen", newValue);
        target.prop("view", newValue);
      },
      _register_dom_change : function(target, changeHandler, bindContext){
        target.bind("datetoggleon", function(e){
          changeHandler(e.originalEvent.detail.iso, bindContext);
        });
        return function(){
          //we need a date only formatter but simply calling toISOString is not bad 
          //since this function will be never invoked currently(due to the current internal design) 
          changeHandler(target.prop("chosen").toISOString(), bindContext);
        }
      }
    };
  };
  Aj.init(function($scope){
    $scope.data = {};
    $scope.snippet("body").bind($scope.data, {
      calendar: [
        Aj.form({name: "calendar-input"}, "keyup"),
        "#calendar-value",
        BrickCalendar("#my-calendar"),
      ]
    });
  });
});
