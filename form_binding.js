$(function () {

  Aj.init(function ($scope) {
    console.log($scope);

    $scope.data = {};
    $scope.dataOption = {};

    $scope.snippet("body").bind($scope.data, {
      name : [
        "#name-pre", {
          _form : "name"
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
        "#sex-pre", {
          _form : "sex"
        }
      ],
      language : [
        "#language-pre", {
          _form : "language"
        }
      ],
      desc : [
        "#desc-pre", {
          _form : {
            _name : "desc",
            _extra_change_events : ["keyup"]
          }
        }
      ]
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
