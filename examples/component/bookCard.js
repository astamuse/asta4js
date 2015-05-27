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
          $scope.snippet($(self.shadowRoot)).bind($scope.data, {
            book: {
              title: ".x-title"
            }
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
