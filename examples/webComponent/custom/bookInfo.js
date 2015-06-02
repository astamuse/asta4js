$(function(){
  Aj.init(function($scope){
    $scope.data = {
      books: [
        {
          title: "hero",
          authors: ["Michael", "Joe"],
          year : 1980
        },
        {
          title: "escape",
          authors: ["Suzuki", "Liu"],
          year : 1990
        },
      ]
    };
    $scope.snippet(".x-book-info-snippet").bind($scope.data,{
      books: {
        _duplicator: ".x-row",
        _item: {
          _index: "tr.x-row@>[idx=]",
          title: ".x-title",
          authors: {
            _duplicator: ".x-person",
            _item: {
              _value: ":root"
            }
          },// authors
          year: ".x-year"
        }
      },//books,
      currentBook: [
        {
          _selector: "#edit-card",
          _render: function(target, newValue){
            target.prop("book", newValue);
          }
        },
        {
          _selector: "#edit-card-wrapper@>[style:display=]",
          _transform: function(v){
            return v ? "block": "none";
          }
        }
      ]
    }).on("click", "tr.x-row", function(){
      $("tr.x-row").removeClass("current-row");
      var self = $(this);
      var idx = parseInt(self.attr("idx"));
      if($scope.data.currentBook == $scope.data.books[idx]){
        //cancel selection
        $scope.data.currentBook = null;
      }else{
        //switch selection
        $scope.data.currentBook = $scope.data.books[idx];
        self.addClass("current-row");
      }
    });


  });//end init
});