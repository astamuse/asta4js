$(function () {

  Aj.init(function ($scope) {
    console.log($scope);
    
    $scope.dataOption = {};
    Aj.delay(function(){
      $scope.dataOption = {
        bloodTypes:["A", "B", "AB", "O"],
        genders:[
            {
                "value": 0,
                "text": "female"
            },
            {
                "value": 1,
                "text": "male"
            }
        ],
        languages: ["English", "Japanese", "Chinese"]
      };  
    }, 1000);
    

    /*
    _form:{
      _default_change_event: "",
      _extra_change_events: []
    }
    */
    $scope.editData = {};
    $scope.snippet("body").bind($scope.editData, {
      name : Aj.form(),
      bloodType : Aj.form().withOption($scope.dataOption,"bloodTypes"),
      sex : Aj.form("sex", "click").withOption($scope.dataOption,"genders", ".x-sex-group"),
      language : Aj.form({name:"language"}, "click").withOption($scope.dataOption,"languages", ".x-lang-group"),
      "private": Aj.form({}, "click").asSingleCheck(),
      desc : Aj.form({selector: "[name=desc]"})
    });
    
    $scope.data = {
      //list : null
    };
    $scope.snippet("body").bind($scope.data, {
      list: {
        _duplicator: ".x-row",
        _item: {
          _index    : [
            ".x-seq",
            ".x-remove@>[index=]",
          ],
          name      : ".x-name",
          bloodType : ".x-bloodtype",
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
          language  : ".x-lang",
          "private" : ".x-private",
          desc      : ".x-desc"
        }
      }
    }).on("click", ".x-remove", function(){
      var currentIndex = parseInt($(this).attr("index"));
      //getCurrentIndex()
      $scope.data.list.splice(currentIndex, 1);
    });
    /*
    $.on()
    $.
    */
    
    $("#addBtn").click(function(){
      var list = $scope.data.list;
      if(!list){
        list = [];
        $scope.data.list = list;
      }
      list.push(Aj.util.clone($scope.editData));
      $scope.editData={};
      Aj.sync();
    });

  });

});
