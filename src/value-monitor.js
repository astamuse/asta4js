"use strict";

var _ = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var ResourceMap = require("./resource-map");

var ValueMonitor=function(scope, varRefRoot){
  this.scope = scope;
  this.varRefRoot = varRefRoot;
  this.observerMap = new ResourceMap();;
}

var convertObservePath=function(rootPath, subPath){
  var observePath;
  if(rootPath){
    observePath = subPath ? rootPath + "." + subPath : rootPath;
  }else{
    observePath = subPath;
  }
  if(!observePath){
      throw "The scope root cannot be observed";
  }
  return observePath;
}

ValueMonitor.prototype.createSubMonitor=function(subPath){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  return new ValueMonitor(this.scope, observePath);
};

ValueMonitor.prototype.pathObserve=function(identifier, subPath, changeFn){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var observer = new _.PathObserver(this.scope, observePath);
  observer.open(changeFn);
  this.observerMap.add(observePath, identifier, {
    discard: function(){
      observer.close;
    }
  });
}

ValueMonitor.prototype.getValueRef=function(subPath){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var path = _.Path.get(observePath);
  var scope = this.scope;
  return {
    setValue : function(v){
      path.setValueFrom(scope, v);
    },
    getValue : function(){
      return path.getValueFrom(scope);
    },
  };
}

ValueMonitor.prototype.arrayObserve=function(identifier, targetArray, changeFn){
  var observer = new _.ArrayObserver(targetArray);
  observer.open(changeFn);
  this.observerMap.add(identifier, identifier, {
    discard: function(){
      observer.close();
    }
  });
}
ValueMonitor.prototype.removeArrayObserve=function(identifier){
  this.observerMap.remove(identifier, identifier);
}

ValueMonitor.prototype.discard=function(){
  this.observerMap.discard();
}

module.exports=ValueMonitor;