$(function () {
  Aj.init(function ($scope) {
    $scope.data = {
      list : [
        {sampleForCheckbox : []},
        {sampleForCheckbox : []},
        {sampleForCheckbox : []}
      ]
    };
    $scope.optionData = {
      sample : ["a","b","c"]
    };
    $scope.snippet("body").bind($scope.data, {
      list : {
        _duplicator : "li.row",
        _item : {
          _index: [
            "input@>[aindex=]",
            ".x-preview@>[aindex=]",
          ],
          sampleForCheckbox : [
            Aj.form({},"click").withOption($scope.optionData,"sample",".x-duplicator"),
            ".x-preview"
          ]
        }
      }
    }).bind(".x-clean", "click", function(){
      $scope.data.list = [];
      Aj.delay(function(){
        $("#error-msg").text(Aj.__internal__.Observe.Observer._errorThrownDuringCallback);
      }, 0, 5);
    });
  });
});

