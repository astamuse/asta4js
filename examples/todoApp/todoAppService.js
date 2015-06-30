var EMPTY_ARRAY = [];

var service = {
  getListData: function(callback){
    //data initialization
    $.ajax({
      type: "get",
      url: "test.json",
    }).done(function(data){
      callback(data);
    }).fail(function(){
      //fallback
      var list = [
        {
          text: "auto-1-fallback"
        },
        {
          text: "auto-2-fallback"
        }
      ];
      callback(list);
    });
  },
  
  calUIControlData : function(list){
    var control = {};
    
    var calList = list
    if(!calList){
      calList = EMPTY_ARRAY; // make cal simpler
    }
    
    var completeCount = 0;
    for(var i in calList){
      if(calList[i].complete){
        completeCount++;
      }
    }
    
    control.count = list.length;
    control.completeCount = completeCount;
    control.unCompleteCount = list.length-completeCount;
    control.allCompleted = completeCount == list.length;
    return control;

  };
};

define(service);