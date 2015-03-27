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
            Aj.form.singleCheck({name:"todo-complete"}, "click"), //response on click
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
    
    //bind ui control data
    $scope.snippet("#todoapp").bind($scope.uiControlData,{
      mainDisplay: "#main@>[style:display=]",
      clearDisplay: "#clear-completed@>[style:display=]",
      completeCount: ".x-complete-count",
      unCompleteCount: ".x-uncomplete-count",
      allCompleted: Aj.form.singleCheck("#toggle-all", "click")
    });
    
    //handler to recalculate all the control data
    $scope.calUIControlData = function(){
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
      list: [
      $scope.calUIControlData,
      {
        length: $scope.calUIControlData,
        _item:{
          complete: $scope.calUIControlData
        }
      }]
    });
    

    //following is the event binding

    //must use on for dynamically generated array items
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
    
    //mark all complete/uncomplete
    $("#toggle-all").click(function(){
      $scope.data.list.forEach(function(t){
        t.complete = $scope.uiControlData.allCompleted;
      });
      //this is necessary currently, but should can be ignored later
      Aj.sync();
    });

    //clear all completed
    $("#clear-completed").click(function(){
      var list = $scope.data.list;
      for(var i=list.length-1;i>=0;i--){
        if(list[i].complete){
          list.splice(i, 1);
        }
      }
      //this is necessary currently, but should can be ignored later
      Aj.sync();
    });
    
    //enter key to add new item
    $("#new-todo").keypress(function(e){
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
      
      //this is necessary currently, but should can be ignored later
      Aj.sync();
      
    });

    $.ajax({
      type: "get",
      url: "test.json",
    }).done(function(data){
      var list = data;
      $scope.data.list = list;
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
