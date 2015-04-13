"use strict";

var _lib_observe = require("../lib/observe");


var config = require("./config");
var Snippet = require("./snippet");
var rewriteObserverMeta = require("./meta");

var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");

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




Scope.prototype.observe = function(varRef, meta){
  var refPath = determineRefPath(this, varRef);
  var monitor = new ValueMonitor(this, refPath);
  var context = new BindContext(monitor);

  var rewittenMeta = rewriteObserverMeta(refPath, meta);
  context.bind(rewittenMeta);
  
};


Scope.prototype.snippet = function(selector){
  return new Snippet(this, selector);
};

config.scope.create=function(){
  return new Scope();
}