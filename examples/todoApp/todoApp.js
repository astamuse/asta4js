Aj.init(["todoAppService"], function (service, $scope) {
  //declare the basic data holder
  $scope.data={
      newTodo: "",
      //field declaration is not necessary but declared fields makes source more clear
      list:[]
  };
  
  service.getListData(function(list){
    $scope.data.list = list;
  });
  
  //basic edit and display binding
  $scope.snippet("#todoapp").bind($scope.data, {
    newTodo: Aj.form({}, "keypress"),
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

  //define a control data structure to reflect the UI functionalities
  $scope.uiControlData = {
      //mainDisplay: "",
      //completeCount: 0,
  };

  //observe the data to response ui control recalculating
  var calUIControlData = function(){
    $scope.uiControlData = service.calUIControlData($scope.data.list);
  };
  $scope.observe($scope.data, {
    list:
    {
      _splice: calUIControlData,
      _value : calUIControlData,
      _item:{
        complete: calUIControlData
      }
    }
  });
  
  //bind ui control data
  $scope.snippet("#todoapp").bind($scope.uiControlData,{
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
  

  //following is the event binding

  //static binding on global operations
  $scope.snippet("#todoapp")
    .bind("#new-todo", "keypress",  function(e){
      if(e.keyCode != 13){
        return;
      }
      var todo = {
        text: $scope.data.newTodo,
        complete: false
      }
      $scope.data.list.push(todo);
      
      //due to 2w binding, we'd better change the value later
      Aj.delay(function(){
        $scope.data.newTodo = "";
      });
    }).bind("#toggle-all", "click", function(){//mark all complete/uncomplete
      $scope.data.list.forEach(function(t){
        t.complete = $scope.uiControlData.allCompleted;
      });
    }).bind("#clear-completed", "click", function(){//clear all completed
      var list = $scope.data.list;
      for(var i=list.length-1;i>=0;i--){
        if(list[i].complete){
          list.splice(i, 1);
        }
      }
    });
  
  //dynamical binding generated array items
  $scope.snippet("#todoapp")
    .on("dblclick", ".x-todo-item", function(){//double click to edit
      $(this).addClass("editing");
    }).on("blur", ".x-todo-item", function(){//blur to exit edit
      $(this).removeClass("editing");
    }).on("keypress", ".x-todo-item", function(e){//enter to exit edit
      if(e.keyCode != 13){
        return;
      }else{
        $(this).blur();
      }
    }).on("click", ".destroy", function(){ //click to destroy current item
      Aj.getContext(this).getArrayAssistant().remove();
    });
  
  
});

