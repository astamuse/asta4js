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
    
    
    
      name : Aj.form(),
      bloodType : Aj.form().withOption($scope.dataOption,"bloodTypes"),
      sex : Aj.form("sex", "click").withOption($scope.dataOption,"genders", ".x-sex-group"),
      language : Aj.form({name:"language"}, "click").withOption($scope.dataOption,"languages", ".x-lang-group"),
      "private": Aj.form({}, "click").asSingleCheck(),
      desc : Aj.form({selector: "[name=desc]"})