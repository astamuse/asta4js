"use strict";

var util = require("./util");

var ResourceList=function(){
  this.head = {};
  this.tail = this.head;
}
ResourceList.prototype.isEmpty=function(){
  return !this.head.next;
}

ResourceList.prototype.add=function(identifier, discardable){
  var node = {
    identifier: identifier,
    discardable: discardable
  };
  node.prev = this.tail;
  this.tail.next = node;
  
  this.tail = node;
  
}

ResourceList.prototype.remove=function(identifier){
  var node = this.head.next;
  while(node){
    if(node.identifier === identifier){
      node.discardable.discard();
      node.prev.next = node.next;
      if(node.next){
        node.next.prev = node.prev;
      }else{//node is the last
        this.tail = node.prev;
      }
    }
    node = node.next;
  }
}

ResourceList.prototype.get=function(identifier){
  var found;
  var node = this.head.next;
  while(node){
    if(node.identifier === identifier){
      found = node.discardable;
      break;
    }
    node = node.next;
  }
  return found;
}

ResourceList.prototype.discard=function(){
  var node = this.head;
  while(node){
    node.discardable.discard();
    node = node.next;
  }
  //cannot be used any more
  delete this.head;
  delete this.tail;
}

var ResourceMap=function(){
  this.map = {};
}

ResourceMap.prototype.getList=function(category){
  var list = this.map[category];
  if(!list){
    list = new ResourceList();
    this.map[category] = list;
  }
  return list;
}

ResourceMap.prototype.add=function(category, identifier, discardable){
  var list = this.getList(category);
  list.remove(identifier);
  list.add(identifier, discardable);
}

ResourceMap.prototype.remove=function(category, identifier){
  var list = this.getList(category);
  list.remove(identifier);
  if(list.isEmpty()){
    delete this.map[category];
  }
};

ResourceMap.prototype.get=function(category, identifier){
  var list = this.getList(category);
  return list.get(identifier);
};

ResourceMap.prototype.discard=function(){
  for(var p in this.map){
    this.map[p].discard();
  }
  delete this.map;
}

module.exports=ResourceMap;