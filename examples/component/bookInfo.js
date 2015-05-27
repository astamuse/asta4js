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
      }//books
    }).on("click", "tr.x-row", function(){
      $("tr.x-row").removeClass("current-row");
      $(this).addClass("current-row");
      var idx = parseInt($(this).attr("idx"));
      $("#edit-card").prop("book", $scope.data.books[idx]);
      return false;
    });
  });
  
  $("body").click(function(){
    $(".x-book-info-snippet tr.x-row").removeClass("current-row");
  });
});