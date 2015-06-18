"use strict";

var config=require("./config")
var constant = require("./constant")
var util = require("./util")

var nestedBinding = function(currentMetaRef, nestedPropertyName, rootSelector, childRootParentSelector){
  var root = document.querySelector(rootSelector);
  root = document.importNode(root, true);
  
  return {
    _selector: childRootParentSelector,
    _render: function(target, newValue, oldValue, bindContext){
      if(bindContext._childNodesScopeRef){
        bindContext._childNodesScopeRef.currentNode = newValue;
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
                _scope.currentNode = newValue;
                var childMeta = {};
                childMeta[nestedPropertyName] = currentMetaRef;
                _scope.snippet(target).bind(_scope.currentNode, childMeta);
              });
            });
          }
        });
      }
    }
  }
}

var _nest = function(meta){
  var nestDef = meta._nest;
  delete meta._nest;
  
  //this is a performance issue that will be executed everytime even we only need it at the first time
  var root = document.querySelector(nestDef._root);
  var nestedDomRoot = document.importNode(root, true);
  
  meta._selector = nestDef._child_root_parent;
  meta._render = function(target, newValue, oldValue, bindContext){
    
    var cacheHoldingContext = bindContext;
    while(cacheHoldingContext){
      if(cacheHoldingContext._nestedCache && cacheHoldingContext._nestedCache._meta_id === nestDef._meta_id){
        break;
      }
      cacheHoldingContext = cacheHoldingContext._backgroundContext;
    }
    
    if(cacheHoldingContext){
      bindContext._nestedCache = cacheHoldingContext._nestedCache;
    }else{
      var parentMeta = this;
      while(parentMeta._meta_id !== nestDef._meta_id){
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