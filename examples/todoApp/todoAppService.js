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

  calStatistics : function(list){
    var stat = {};
    
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
    
    stat.count = list.length;
    stat.completeCount = completeCount;
    stat.unCompleteCount = list.length-completeCount;
    stat.allCompleted = completeCount == list.length;
    return stat;

  }
};

define(service);