(function(){
  var currentScript = document._currentScript || document.currentScript;
  var BookCard = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function(){
        var t = currentScript.ownerDocument.querySelector("#bookCardTemplate");
        var clone = t.content.cloneNode(true);
        var sRoot = this.createShadowRoot();
        sRoot.appendChild(clone);
        
        this.data = {};
        this.shadowRoot = sRoot;
      }
    },
    attachedCallback : {
      value : function(){
        this.data.book = this.getAttribute("book");
        var self = this;
        Aj.init(function($scope){
          $scope.data = self.data;
          $scope.snippet($(self.shadowRoot).find("#card")).bind($scope.data, {
            book: {
              title: Aj.form({},null, ["keyup"]),
              year: Aj.form({},null, ["keyup"]),
              authors:{
                _duplicator: ".person-row",
                _item:{
                  _index: ".x-remove@>[index=]",
                  _value: Aj.form({name: "person"}, null, ["keyup"])
                }
              }
            }
          }).bind(".x-add", "click", function(e){
            $scope.data.book.authors.push("");
          }).on("click", ".x-remove", function(e){
            var index = parseInt($(this).attr("index"));
            $scope.data.book.authors.splice(index, 1);
          });
        });
      }
    }
  });
  
  Object.defineProperties(BookCard, {
    'book': {
      set: function(v){
        if(v && typeof v === "string"){
          this.data.book = JSON.parse(v);
        }else{
          this.data.book = v;
        }
      },
      get: function(v){
        return this.data.book;
      }
    }
  });
  
  document.registerElement('book-card', {prototype: BookCard});
})();
