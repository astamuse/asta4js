"use strict";

var _lib_observe = require("../lib/observe");

var config = require("./config");
var Snippet = require("./snippet");
var rewriteObserverMeta = require("./meta");

var ObserverMap = function(){
  this.map = {};
};

ObserverMap.prototype.add = function(path, observer, identifier){
  var item = {
    identifier: identifier,
    prev: null,
    next: null,
    close: function(){
      observer.close();
      if(this.prev){
        this.prev.next = this.next;
      }
      if(this.next){
        this.next.prev = this.prev;
      }
    }
  };
  var head = this.map[path];
  if(!head){
    head = {
      prev: null,
      next: null,
      close: function(){}
    };
    head.prev = head;
    head.next = head;
    this.map[path] = head;
  }
  var tail = head.prev;
  
  tail.next = item;
  
  item.prev = tail;
  item.next = head;
  
  head.prev = item;
  
  return item;
};

ObserverMap.prototype.getObserverList = function(path, identifier){
  var list = [];
  var head = this.map[path];
  var item = head.next;
  while(item && item != head){
    if(identifier){
      if(item.identifier == identifier){
        list.push(item);
      }
    }else{
      list.push(item);
    }
    item = item.next;
  }
  return list;
};

var Scope = function(){
  this.observerMap = {
    path: new ObserverMap(),
    splice: new ObserverMap()
  };
};

Scope.prototype.registerPathObserver = function(path, changeFn, identifier){
  var observer = new _lib_observe.PathObserver(this, path);
  observer.open(changeFn);
  return this.observerMap.path.add(path, observer, identifier);
};

Scope.prototype.registerArrayObserver = function(path, targetObj, changeFn, identifier){
  var observer = new _lib_observe.ArrayObserver(targetObj);
  observer.open(changeFn);
  return this.observerMap.splice.add(path, observer, identifier);
};

Scope.prototype.removeArrayObserver = function(path, identifier){
  var list = this.observerMap.splice.getObserverList(path, identifier);
  for(var i=0;i<list.length;i++){
    list[i].close();
  }
};

Scope.prototype.removePathObserver = function(path, identifier){
  var list = this.observerMap.path.getObserverList(path, identifier);
  for(var i=0;i<list.length;i++){
    list[i].close();
  }
};

var determineRefPath = function (scope, varRef) {
  var searchKey = "ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";
  varRef[searchKey] = 1;

  var refPath = null;
  for (var p in scope) {
    var ref = scope[p];
    if (ref[searchKey] == 1) {
      refPath = p;
      break;
    }
  }

  varRef[searchKey] = null;
  delete varRef[searchKey];

  return refPath;
};
  
Scope.prototype.observe = function(varRef, meta, bindContext){
  var refPath = determineRefPath(this, varRef);
  var rewittenMeta = rewriteObserverMeta(refPath, meta);
  var context = {};
  if(bindContext){
    //we do not do deep copy, only the first layer
    for(var k in bindContext){
      context[k] = bindContext[k];
    }
  }
  //make sure the scope is current scope
  context._scope = this;
  this.bindMeta(rewittenMeta, context);
};

Scope.prototype.bindMeta = function(meta, bindContext){
  var THIS = this;
  if(Array.isArray(meta)){
    meta.forEach(function(m){
      THIS.bindMeta(m, bindContext);
    });
    return;
  }
  var nonRecursive = ["_value", "_splice"];
  for(var i in nonRecursive){
    var sub = meta[nonRecursive[i]];
    if(!sub){
      continue;
    }
    sub.forEach(function(sm){
      if(sm._register_on_change){
        var changeHandler = sm._change_handler_creator.call(sm, bindContext, sm._on_change);
        var force = sm._register_on_change.call(sm, bindContext, function(){
          changeHandler.apply(sm, arguments);
        });
        force.apply();
      }
      if(sm._register_assign){
        var assignChangeHandler = sm._assign_change_handler_creator.call(sm, bindContext, sm._assign);
        var force = sm._register_assign.call(sm, bindContext, function(){
          assignChangeHandler.apply(sm, arguments);
          Aj.sync();
        });
        //force.apply
      }
      if(sm._post_binding){
        sm._post_binding.forEach(function(pb){
          pb.call(sm, bindContext)
        });
      }
    });
  }
  
  var propSub = meta._prop;
  if(!propSub){
    return;
  }
  propSub.forEach(function(ps){
    for(var p in ps){
      var pm = ps[p];
      if(!pm){
        continue;
      }
      THIS.bindMeta(pm, bindContext);
    }
  });
};

Scope.prototype.snippet = function(selector){
  var root = $(selector);
  return new Snippet(this, root);
};

config.scope.create=function(){
  return new Scope();
}