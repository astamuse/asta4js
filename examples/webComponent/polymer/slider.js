$(function(){
  Aj.init(function($scope){
    
    var PaperSlider=function(selector){
      return {
        _selector: selector,
        
        _render:function(target, newValue, oldValue){
          if(target.prop("immediateValue") !== newValue){
            target.attr("value", newValue);
          }
        },//_render
        
        _register_dom_change : function(target, changeHandler, bindContext){
          target.bind("immediate-value-change", function(e){
            changeHandler(target.prop("immediateValue"), bindContext);
          });
          return function(){
            changeHandler(target.prop("immediateValue"), bindContext);
          }
        }//_register_dom_change
        
      }//return
    }
    
    $scope.data = {
      slider: 40
    };
    $scope.snippet("#slider-snippet").bind($scope.data,{
      slider: [
        Aj.form({},"keyup"),
        PaperSlider("#pSlider")
      ]
    });


  });//end init
});