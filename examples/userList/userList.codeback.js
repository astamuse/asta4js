          sex_display : {
            _selector: ".x-sex",
            _watch   : {
              _fields : ["sex"],
              _cal : function(sex){
                if(sex === ""){
                  sex = undefined;
                }
                return Aj.form.optionText($scope.dataOption.genders, sex);
              }
            }
          },

          
.on("click", ".x-remove", function(){
      var currentIndex = parseInt($(this).attr("index"));
      $scope.data.list.splice(currentIndex, 1);
    })
    
    