/*
Reverse the variable and selector cause we can retrieve the field name by iterate the object's 
properties but it seems confusing.
*/
$(function(){

  Aj.init(function($scope){

    //for the display only data, the binding can be simple
    //(it is still in 1-way binding which means the shown value can be changed if the bound data changed)
    $scope.otherData={};
    $scope.snippet("#displayContent")
          .bind(otherData, {
            size: ".x-size",
            country: ".x-country",
            counter: ".x-counter@>[length]", //set attribute
            isGood: ".x-goog-flag@>[class:good]", //bound css class to a boolean value
            display: ".x-display-control@>[style:display]", //bound style value

            //can be bound to multiple elements by array
            yabi: [
              ".x-yabi", 
              ".x-yabi-other-place",
            ],
            
            //valut to dom can be customized
            reld: {
              _selector: ".x-reld"
              _set: function(targetDOM, value){
              }
            }
            
            //multiple fields binding
            distance: {
              _observer : ["point_x", "point_y"],
              _selector : "x-distance",
              _value    : function(values){
                var x = values["point_x"];
                var y = values["point_y"];
                return x+y;
              },
            }
            
            //list binding
            list: {
              //duplicator means a list(array)
              _duplicator: ".x-list-item",
              name: ".x-item-name",
              age: ".x-item-age"
            }

          });

    //for the form data, 2-way binding, things become a bit of complicated.
    var $scope.data={};
    var data_meta={
      
      //in form data, we can still declare some display only data
      title: {
          _selector: "title",
      },
      
      name  : {
        // declared as form (field) which will be treated as 2-way binding automatically
        _form: {
          name: "name",
        }
      },
      list: {
        _selector: "#list li",
        yza: ".x-item-yaz", // object structure can be ignored when selector only
        year: {
          _form: {
            name: "year",
            validation:{ //declare the validation here
              ...
            }
          }
        },
        sex: {
          _form: {
            name: "gender",
            validation:{
              ...
            },
            set: function(){}, // value set/get can be customized
            get: function(){}
          }
        }
      }
    };
    
    //define a data structure to supply the option data 
    var $scope.optionData={
    };
  
    // multiple data can be bound. And the meta can be declared dynamically here.
    $scope.snippet("#content")
      .bind($scope.data, data_meta)
      .bind($scope.optionData, {
        yearList: {
          _form_option: "year"// object structure ignored
        }
        genders: {
          _form_option: {
            name: ["gender"], //can be bound to multiple input elements
            value: function(g){return g.id;}, //custmoize how to set value and text of option
            text: function(g){return g.txt;},
          }
        }
      });


    $("#doSomeThing").click(function(){
      $scope.data.title = "xxx";
      $scope.data.name = "yyy";
      $scope.data.list = ["aa", "bb", "cc"];
      $scope.data.list2 = ["AA", "BB", "CC"];
    });
    
    //retrieve init data
    ajax.onSuccess(function(){
      $scope.data={};
      $scope.optionData={};
      $scope.otherData={};
    });
  });
});