"use strict";

var config=require("./config")
var constant = require("./constant")
var util = require("./util")

/**
 * This function is used to show how simple we can wrap a common rendering/binding logic
 */
var nestedBinding = function(childRootParentSelector, rootSelector, treeMetaRefGetter){
  var root = document.querySelector(rootSelector);
  root = document.importNode(root, true);
  
  return {
    _selector: childRootParentSelector,
    _render: function(target, newValue, oldValue, bindContext){
      if(bindContext._childNodesScopeRef){
        bindContext._childNodesScopeRef.currentNodes = newValue;
      }else{
        //we have to delay the children binding due to avoiding the binding selectors of 
        //properties to be propagated to the child tree
        Aj.delay(function(){
          target.find(rootSelector).remove();
          if(newValue){
            var clone = document.importNode(root, true);
            target.append(clone);
            bindContext.asBackground(function(){
              Aj.init(function(_scope){
                bindContext._childNodesScopeRef = _scope;
                _scope.currentNodes = newValue;
                _scope.snippet(target).bind(_scope.currentNodes, treeMetaRefGetter.apply());
              });
            });
          }
        });
      }
    }
  }
}

/**
 * This function is used to make developer's life better (since it had made me vomit)
 */
var _nest = function(meta){
  var nestDef = meta._nest;
  delete meta._nest;
  
  //this is a performance issue that will be executed everytime even we only need it at the first time
  var root = document.querySelector(nestDef._root);
  var nestedDomRoot = document.importNode(root, true);
  
  meta._selector = nestDef._child_root_parent;
  meta._render = function(target, newValue, oldValue, bindContext){
    
    /*
     * The following is ugly but we have no way to retrieve and store the original tree root DOM before 
     * it has been rendered by given data. Perhaps we need some infrastructural support from framework core
     * to combat this ugly implementation, but let us make it workable at first.
     */
     //start the vomiting logic
    var cacheHoldingContext = bindContext;
    while(cacheHoldingContext){
      if(cacheHoldingContext._nestedCache && cacheHoldingContext._nestedCache._meta_id === nestDef._meta_id){
        break;
      }
      cacheHoldingContext = cacheHoldingContext._parentContext ?  
                              cacheHoldingContext._parentContext : cacheHoldingContext._backgroundContext;
    }
    
    if(cacheHoldingContext){
      bindContext._nestedCache = cacheHoldingContext._nestedCache;
    }else{
      var parentMeta = this;
      while(parentMeta && parentMeta._meta_id !== nestDef._meta_id){
        parentMeta = parentMeta._parent_meta;
      }
      if(parentMeta){
        bindContext._nestedCache = {
          _meta_id: nestDef._meta_id,
          _dom_root: nestedDomRoot,
          _meta_root : parentMeta._orginal_meta
        }
      }else{
        throw "Could not find nesting target meta root by given _meta_id:" + nestDef._meta_id;
      }

    }
    // finished the vomiting reality, GBUA!
    
    // following is as the same as the above function
    if(bindContext._childNodesScopeRef){
      bindContext._childNodesScopeRef.currentNodes = newValue;
    }else{
      //we have to delay the children binding due to avoiding the binding selectors of 
      //properties to be propagated to the child tree
      Aj.delay(function(){
        target.find(nestDef._root).remove();
        if(newValue){
          var clone = document.importNode(bindContext._nestedCache._dom_root, true);
          target.append(clone);
          bindContext.asBackground(function(){
            Aj.init(function(_scope){
              bindContext._childNodesScopeRef = _scope;
              _scope.currentNodes = newValue;
              _scope.snippet($(clone)).bind(_scope.currentNodes, bindContext._nestedCache._meta_root);
            });//Aj.init
          });//background context
        }//end newValue
      });//delay
    }
  }
}

config.meta.rewritterMap["_nest"] = {
  priority : constant.metaRewritterPriority["_nest"],
  fn : _nest
};

module.exports = nestedBinding;