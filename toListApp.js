$(function () {

  Aj.init(function ($scope) {
    
    //declare some help binding function
    var singleCheckBinding = function(selector){
      return {
        _selector: selector,
        _form:{
          _extra_change_events: ["click"],
          _single_check: true
        }
      };
    };

    //declare the basic data holder
    $scope.data={
        
        newTodo: "",
        
        //field declaration is not necessary but declared fields make source more clear
        
        //list:[]  
    };
    
    //here we make the global controls/hints work
    $scope.controlData = {
        //mainDisplay: "",
        //completeCount: 0,
    };
    
    //handler to recalculate all the control data
    $scope.recalControlData = function(){
      var control = $scope.controlData;
      
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
      control.allCompleted = completeCount == list.length;
      control.clearDisplay = completeCount > 0 ? "block" : "none";
      control.completeCount = completeCount;
      control.unCompleteCount = list.length-completeCount;
    };
    
    $scope.snippet("#todoapp").bind($scope.controlData,{
      mainDisplay: "#main@>[style:display=]",
      clearDisplay: "#clear-completed@>[style:display=]",
      completeCount: ".x-complete-count",
      unCompleteCount: ".x-uncomplete-count",
      allCompleted: singleCheckBinding("#toggle-all")
    });
    
    $("#toggle-all").click(function(){
      $scope.data.list.forEach(function(t){
        t.complete = $("#toggle-all").prop("checked");
      });
      Aj.sync();
    });

    $("#clear-completed").click(function(){
      var list = $scope.data.list;
      for(var i=list.length-1;i>=0;i--){
        if(list[i].complete){
          list.splice(i, 1);
        }
      }
    });
    
    //now we begin to bind edit and list
    var newTodoEditBinding = {
      _form:{
        _default_change_event: "keypress"
      }
    };
    
    var listTodoEditBinding = function(selector){
      return {
        _selector: selector,
        _form:{}
      };
    };

    $scope.snippet("#todoapp").bind($scope.data, {
      newTodo: newTodoEditBinding,
      list:{
        _duplicator: ".x-todo-item",
        _item:{
          _index: ".destroy@>[index=]",
          text: [
            listTodoEditBinding("[name=todo-input]"),
            ".x-todo-text"
          ],
          complete: [
            singleCheckBinding("[name=todo-complete]"),
            ".x-todo-item@>[class:done?]",
            {
              _selector: ":root", //we will do nothing
              _render: function(target, newValue){
                //we simply do recal to invoke controls
                $scope.recalControlData();
              }
            }
          ]
        },
        length: {
          _selector: ":root", //we will do nothing
          _render: function(target, newValue){
            //we simply do recal to invoke controls
            $scope.recalControlData();
          }
        }
      }
    }).on("dblclick", ".x-todo-item", function(){//must use on for dynamically generated array items
      $(this).addClass("editing");
    }).on("blur", ".x-todo-item", function(){
      $(this).removeClass("editing");
    }).on("keypress", ".x-todo-item", function(e){
      if(e.keyCode != 13){
        return;
      }else{
        $(this).blur();
      }
    }).on("click", ".destroy", function(){
      var index = parseInt($(this).attr("index"));
      $scope.data.list.splice(index, 1);
    });
    
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
      

      $scope.data.newTodo = "";
      //this is necessary currently, but should can be ignored later
      Aj.sync();
      
    });
    
  });

});
