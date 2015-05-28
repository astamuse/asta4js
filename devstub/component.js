(function(){
  var currentScript = document._currentScript || document.currentScript;
  var component = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function(){
        var t = currentScript.ownerDocument.querySelector("#component-template");
        var clone = t.content.cloneNode(true);
        var sRoot = this.createShadowRoot();
        sRoot.appendChild(clone);
      }
    },
  });
  
  document.registerElement('my-component', {prototype: component});
})();
