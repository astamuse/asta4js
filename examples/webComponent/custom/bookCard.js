(function(){
  var currentScript = document._currentScript || document.currentScript;
  var currentDocument = currentScript.ownerDocument;
  
  var BookCard = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function(){
        var t = currentDocument.querySelector("#bookCardTemplate");
        var clone = currentDocument.importNode(t.content, true);
        var sRoot = this.createShadowRoot();
        sRoot.appendChild(clone);
        this.data = {};
        this.shadowRoot = sRoot;
      }
    },
    attachedCallback : {
      value : function(){
        var self = this;
        
        Aj.init(function($scope){
          $scope.data = self.data;
          $scope.snippet($(self.shadowRoot).find("#card")).bind($scope.data, {
            book: {
              title: Aj.form({},null, ["keyup"]),
              year: Aj.form({},null, ["keyup"]),
              authors:[
                //editing
                {
                  _selector: ".x-persons",
                  _render:function(target, newValue){
                    target.prop("persons", newValue);
                  },
                  _register_dom_change:function(target, changeHandler, bindContext){
                    target.bind("change", function(){
                      var v = target.prop("persons");
                      changeHandler(v, bindContext);
                    });
                    return function(){
                      changeHandler(target.prop("persons"), bindContext);
                    };
                  }
                },
                //preview
                {
                  _duplicator: ".person-row",
                  _item:{
                    _value: "li"
                  }
                }
              ]
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
