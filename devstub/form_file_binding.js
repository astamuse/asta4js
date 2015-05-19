$(function () {
  Aj.init(function ($scope) {
    $scope.data = {};
    $scope.snippet("body").bind($scope.data,{
      tfile: [
        Aj.form(),
        {
          _selector: "#tfile-prev",
          _render: function(target, newValue, oldValue){
            target.text(JSON.stringify(newValue));
          }
        }
      ],
      tfiles: [
        Aj.form().fileOption(1000),
        {
          _duplicator: "#tfiles-prev",
          _item: {
            _value: {
              _selector: ":root",
              _debug: "tfiles debug",
              _render: function(target, newValue, oldValue){
                target.text(JSON.stringify(newValue));
              }
            }
          },//_item,
          _debug: "tfiles array",
          //_omit_target_not_found: true
        }
      ]
    });
  });
});
