$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

   
    $scope.dataOption = {};

    var langOption = function(duplicator){
      return Aj.optionBind($scope.dataOption,{
        languages:{
          _duplicator: duplicator
        }
      });
    };

    $scope.data = {};
    $scope.snippet("body").bind($scope.data, {
      name : [
        "#name-pre", {
          _form : {}
        }
      ],
      /*
      bloodType : [
        "#bloodType-pre", {
          _form : {
            _name: "bloodType",
            _option: Aj.optionBind($scope.dataOption,"bloodTypes")
          }
        }
      ],
      sex : [
        "#sex-pre", {
          _form : {
            _name: "sex",
            _option: Aj.optionBind($scope.dataOption, {
              genders: {
                _duplicator: ".x-sex-group",
                _value: function(v){return v.value;},
                _text: function(v){return v.name;}
              }
            })
          }
        }
      ],
      language : [
        "#language-pre", {
          _form : {
            _name: "language",
            _extra_change_events: ["click"],
            _option:langOption(".x-lang-group")
          }
        }
      ],
      */
      /*
      language2 : [
        "#language2-pre", {
          _form : {}
        }
      ],
      */
      /*
      "private": {
        _form: {
          _name : "private",
          _single_check: true
        }
      },
      agree: {
        _form: {
          _name : "agree",
          _single_check: true
        }
      },
      desc : [
        "#desc-pre", {
          _form : {
            _name : "desc",
            _extra_change_events : ["keyup"]
          }
        }
      ]
      */
    });

    $("#confirm-value").click(function () {
      $("#confirm-value-pre").text(JSON.stringify($scope.data));
    });

    $("#set-value").click(function () {
      var v = $("#data-input").val();
      $scope.data = JSON.parse(v);
      Aj.sync();
    });
    
    $("#set-option").click(function () {
      var v = $("#option-input").val();
      $scope.dataOption = JSON.parse(v);
      Aj.sync();
    });
  });

});
