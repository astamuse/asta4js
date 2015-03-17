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
        "#bloodType-pre",{
          _form: "bloodType"
        }
      ],
      sex : [
        "#sex-pre", {
          _form : "sex"
        }
      ],
      language : [
        "#language-pre",{
          _form: "language"
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
    }).bind($scope.dataOption, {
      languages:{
        _form_option:{
          name: "language"
        }
      }
    });

    $("#confirm-value").click(function () {
      $("#confirm-value-pre").text(JSON.stringify($scope.data));
    });

    $("#set-value").click(function () {
      var v = $("#data-input").val();
      $scope.data = JSON.parse(v);
      Aj.sync();
    });
  });

});
