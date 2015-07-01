Aj.init(["todoAppService"], function (service, $scope) {
  /*
   * declare the basic data holder
   */
  $scope.data={
      newTodo: "",
      //field declaration is not necessary but declared fields makes source more clear
      list:[],
  };
  
  /*
   * new item binding
   */
  $scope.snippet("#todoapp").bind($scope.data, {
    newTodo: Aj.form({}, "keypress")
  }).bind("#new-todo", "keyup",  function(e){
    if(e.keyCode != 13){
      return;
    }

    $scope.data.list.push({
      text: $scope.data.newTodo,
      complete: false
    });

    $scope.data.newTodo = "";
  });
  
  
  /*
   * list binding
   */
  
  //init list
  service.getListData(function(list){
    $scope.data.list = list;
  });
  
  //basic edit and display binding
  $scope.snippet("#todoapp").bind($scope.data, {
    list:{
      _duplicator: ".x-todo-item",
      _item:{
        _context: ".destroy",
        text: [
          Aj.form({name:"todo-input"}, "keypress"),
          ".x-todo-text"
        ],
        complete: [
          Aj.form({name:"todo-complete"}, "click").asSingleCheck(), //response on click
          ".x-todo-item@>[class:done?]",
        ]
      },
    }
  });
  
  //item edit actions
  $scope.snippet("#todoapp").on("click", ".destroy", function(){ //click to destroy current item
    var assistant = Aj.getContext(this).getArrayAssistant();
    assistant.remove();
  }).on("dblclick", ".x-todo-item", function(){//double click to edit
    var row = $(this);
    row.addClass("editing");
    row.find("[name=todo-input]").focus();
  }).on("blur", ".x-todo-item", function(){//blur to exit edit
    $(this).removeClass("editing");
  }).on("keypress", ".x-todo-item", function(e){//enter to exit edit
    if(e.keyCode != 13){
      return;
    }else{
      $(this).blur();
    }
  });

  /*
   * global ui control binding
   */
  
  //define a control data structure to reflect the UI functionalities
  $scope.statistics = {
      //mainDisplay: "",
      //completeCount: 0,
  };

  //observe the data to response ui control recalculating
  var calStatistics = function(){
    $scope.statistics = service.calStatistics($scope.data.list);
  };

  $scope.observe($scope.data, {
    list:
    {
      _splice: calStatistics,
      _value : calStatistics,
      _item:{
        complete: calStatistics
      }
    }
  });
  
  //bind ui control data
  $scope.snippet("#todoapp").bind($scope.statistics,{
    count: {
      _selector: "#main@>[style:display=]",
      _transform: function(v){
        return v == 0 ? "none" : "block";
      }
    },
    completeCount: [
      ".x-complete-count",
      {
        _selector: "#clear-completed@>[style:display=]",
        _transform: function(v){
          return v > 0 ? "block" : "none";
        }
      }
    ],
    unCompleteCount: ".x-uncomplete-count",
    allCompleted: Aj.form("#toggle-all", "click").asSingleCheck()
  });
  
  //static binding on global operations
  $scope.snippet("#todoapp").bind("#toggle-all", "click", function(){//mark all complete/uncomplete
    $scope.data.list.forEach(function(t){
      t.complete = $scope.statistics.allCompleted;
    });
  }).bind("#clear-completed", "click", function(){//clear all completed
    var list = $scope.data.list;
    for(var i=list.length-1;i>=0;i--){
      if(list[i].complete){
        list.splice(i, 1);
      }
    }
  });
  
});

