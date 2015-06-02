(function(){
  var currentScript = document._currentScript || document.currentScript;
  var Persons = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function(){
        var t = currentScript.ownerDocument.querySelector("#persons-edit-template");
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
        var root = $(this.shadowRoot);
        var self = this;
        
        Aj.init(function($scope){
          $scope.data = self.data;
          
          $scope.snippet(root.find("#pop")).bind($scope.data, {
            editing:{
              _duplicator: ".person-row",
              _item:{
                _index: ".x-remove@>[index=]",
                _value: Aj.form({name: "person"}, null, ["keyup"])
              }
            }
          }).bind(".x-add", "click", function(e){
            if(Array.isArray($scope.data.editing)){
              $scope.data.editing.push("");
            }else{
              $scope.data.editing = [""];
            }
          }).on("click", ".x-remove", function(e){
            var index = parseInt($(this).attr("index"));
            $scope.data.editing.splice(index, 1);
          });
          
          
          root.find(".x-edit").click(function(){
            $scope.data.editing = Aj.util.clone($scope.data.value);
            Aj.sync();
            dialog.dialog("open");
          });
          
          var dialog = root.find( "#pop" ).dialog({
            autoOpen: false,
            height: 300,
            width: 500,
            modal: true,
            buttons: {
              "OK": function(){
                $scope.data.value = $scope.data.editing;
                $scope.data.editing = undefined;
                dialog.dialog( "close" );
                self.dispatchEvent(new Event("change"));
              },
              Cancel: function() {
                $scope.data.editing = undefined;
                dialog.dialog( "close" );
              }
            },
            close: function() {
              $scope.data.editing = undefined;
            }
          });

        });
        
      }
    }
  });
  
  Object.defineProperties(Persons, {
    'persons': {
      set: function(v){
        var lastValue = this.data.value;
        this.data.value = v;
        if(v != lastValue){
          this.dispatchEvent(new Event("change"));
        }
      },
      get: function(v){
        return this.data.value;
      }
    }
  });

  document.registerElement('persons-edit', {prototype: Persons});
})();
