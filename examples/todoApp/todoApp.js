$(function () {

  Aj.init(function ($scope) {
    //declare the basic data holder
    $scope.data={
        newTodo: "",
        //field declaration is not necessary but declared fields make source more clear
        //list:[]  
    };
    
    //basic edit and display binding
    $scope.snippet("#todoapp").bind($scope.data, {
      newTodo: Aj.form({}, "keypress"),
      list:{
        _duplicator: ".x-todo-item",
        _item:{
          _index: ".destroy@>[index=]",
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

    //handler to recalculate all the control data
    var calUIControlData = function(){
      var control = $scope.uiControlData;
      
      var list = $scope.data.list;
      if(!list){
        list = []; // make cal simpler
      }
      
      var completeCount = 0;
      for(var i in list){
        if(list[i].complete){
          completeCount++;
        }
      }
      
      control.mainDisplay = list.length == 0 ? "none" : "block";
      control.clearDisplay = completeCount > 0 ? "block" : "none";
      control.completeCount = completeCount;
      control.unCompleteCount = list.length-completeCount;
      control.allCompleted = completeCount == list.length;
      
      console.log("recal invoked");
    };
    
    //observe the data to response ui control recalculating
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
      mainDisplay: "#main@>[style:display=]",
      clearDisplay: "#clear-completed@>[style:display=]",
      completeCount: ".x-complete-count",
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
        var list = $scope.data.list;
        if(!list){
          list = [];
          $scope.data.list = list;
        }
        list.push(todo);
        
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
        var index = parseInt($(this).attr("index"));
        $scope.data.list.splice(index, 1);
      });
    
    //data initialization
    $.ajax({
      type: "get",
      url: "test.json",
    }).done(function(data){
      $scope.data.list = data;
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
      $scope.data.list = list;
    });
    
    
  });

});
