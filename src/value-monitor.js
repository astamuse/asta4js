"use strict";

var _ = require("../lib/observe");

var util = require("./util");
var config = require("./config");

var ValueMonitor=function(scope, varRefRoot){
  this.scope = scope;
  this.varRefRoot = varRefRoot;
  this.observeList = [];
}

var convertObservePath=function(rootPath, subPath){
  var observePath;
  if(rootPath){
    observePath = subPath ? rootPath + "." + subPath : rootPath;
  }else{
    observePath = subPath;
    if(!observePath){
      throw "The scope root cannot be observed";
    }
  }
  return observePath;
}

ValueMonitor.prototype.pathObserve=function(subPath, changeFn){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var observer = new _.PathObserver(this.scope, observePath);
  observer.open(changeFn);
  this.observeList.push(observe);

  var path = _.Path.get(observePath);
  return function(){
    changeFn(path.getValueFrom(this.scope), undefined);
  }
}

ValueMonitor.prototype.discard=function(){
  for(var i=0;i<observeList.length;i++){
    this.observeList[i].close();
  }
  /*
  delete this.scope;
  delete this.varRefRoot;
  delete this.observeList;
  */
}

module.exports=ValueMonitor;