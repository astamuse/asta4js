$(function () {

  Aj.init(function ($scope) {
    $scope.data = {
      list : [
        {sampleForSelectbox : undefined},
        {sampleForSelectbox : undefined},
        {sampleForSelectbox : undefined}
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
            "select@>[aindex=]",
            ".x-sample-select@>[aindex=]",
          ],
          sampleForSelectbox : [
            Aj.form().withOption($scope.optionData,"sample"),
            ".x-sample-select"
          ]
        }
      }
    });
  });
});
