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
      //$("#edit-card").prop("book", $scope.data.books[idx]);
      $scope.data.currentBook = $scope.data.books[idx];
      return false;
    }).bind("#edit-card", "click", function(){
      return false;
    });

    $scope.observe($scope.data,{
      currentBook: function(newValue){
        $("#edit-card").prop("book", newValue);
        if(!newValue){
          $("#edit-card").css("display", "none");
        }else{
          $("#edit-card").css("display", "block");
        }
      }
    });

    $("body").click(function(){
      $(".x-book-info-snippet tr.x-row").removeClass("current-row");
      //$("#edit-card").prop("book", null);
      $scope.data.currentBook = null;
    });

  });//end init
});