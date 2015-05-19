$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

   
    $scope.dataOption = {};

    $scope.data = {};
    $scope.snippet("body").bind($scope.data, {
      name : [
        "#name-pre", {
          _form : {}
        }
      ],
      bloodType : [
        "#bloodType-pre", {
          _form : {
            _name: "bloodType",
            _option: Aj.optionBind($scope.dataOption,"bloodTypes")
          }
        }
      ],
      sex : [
        "#sex-pre", 
        Aj.form().withOption($scope.dataOption,{
          genders: {
            _duplicator: ".x-sex-group"
          }
        })
      ],
      language : [
        "#language-pre", {
          _form : {
            _name: "language",
            _extra_change_events: ["click"],
            _option: Aj.optionBind($scope.dataOption,{
              languages:{
                _duplicator: ".x-lang-group"
              }
            })
          }
        }
      ],
      /*
      language2 : [
        "#language2-pre", {
          _form : {}
        }
      ],
      */
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
    }).bind("#confirm-value", "click", function () {
      $("#confirm-value-pre").text(JSON.stringify($scope.data));
    }).bind("#set-value", "click", function () {
      var v = $("#data-input").val();
      $scope.data = JSON.parse(v);
      Aj.sync();
    }).bind("#set-option", "click", function () {
      var v = $("#option-input").val();
      $scope.dataOption = JSON.parse(v);
      Aj.sync();
    });
  });

});
