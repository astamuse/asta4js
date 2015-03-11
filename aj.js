Aj={
  
  obs: new Array(),

  init: function(init_func){
    init_func(Aj.createScope());
  },

  createScope: function(){
    return {
      snippet: function(selector){
        return Aj.createSnippet(this, selector);
      }
    };
  },

  createSnippet: function(scope, selector){
    return {
      _scope: scope,
      _root: $(selector),

      beforeBind: function(varRef, meta){
      },

      bind : function(varRef, meta){
        //find out the ref path at first
        var searchKey = "ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";
        varRef[searchKey] = 1;

        var refPath = null;
        for(var p in this._scope){
          var ref = this._scope[p];
          if(ref[searchKey] == 1){
            refPath = p;
            break;
          }
        }

        varRef[searchKey] = null;
        delete varRef[searchKey];

        for(var p in meta){
          var m = meta[p];
          if($.isArray(m)){
            for(var sm in m){
              this.bindOne(refPath + "." + p, m[sm]);
            }
          }else{
            this.bindOne(refPath + "." + p, m);
          }
        }
      },

      bindOne: function(propertyPath, meta){
        var target = $(meta._selector);
        if(target.length === 0){
          throw "could not found target for selector:" + meta._selector;
        }
        if(meta._register_render){
          meta._register_render(
            this._scope, 
            propertyPath, 
            function(newValue, oldValue){
              meta._render($(meta._selector), newValue, oldValue);
            }
          );
        }
        
        if(meta._register_assign){
          var THIS = this;
          meta._register_assign($(meta._selector), function(value){
            meta._assign(THIS._scope, propertyPath, value);
          }); 
        }
      }

    }
  },

  dummy: ""
  

};
