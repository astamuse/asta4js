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
  this.observerMap.add(observePath, identifier, observer);
}

function setValueWithSpawn(ref, path, value){
  var dotIndex = path.indexOf(".");
  if(dotIndex < 0){
    ref[path] = value;
  }else{
    var firstSeg = path.substring(0, dotIndex);
    var leftSeg = path.substring(dotIndex+1);
    if(!ref[firstSeg]){
      ref[firstSeg] = {};
    }
    setValueWithSpawn(ref[firstSeg], leftSeg, value);
  }
}

ValueMonitor.prototype.getValueRef=function(subPath){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var path = _.Path.get(observePath);
  var scope = this.scope;
  return {
    setValue : function(v, spawnUnreachablePath){
      var success = path.setValueFrom(scope, v);
      if(!success){//unreachable path
          var spawn = spawnUnreachablePath;
          if(spawn === undefined){
            spawn = true; //default to generate all necessary sub path
          }
          if(spawn){
            setValueWithSpawn(scope, observePath, v);
          }
      }
    },
    getValue : function(){
      return path.getValueFrom(scope);
    },
  };
}

ValueMonitor.prototype.arrayObserve=function(identifier, targetArray, changeFn){
  var observer = new _.ArrayObserver(targetArray);
  observer.open(changeFn);
  this.observerMap.add(identifier, identifier, observer);
}
ValueMonitor.prototype.removeArrayObserve=function(identifier){
  this.observerMap.remove(identifier, identifier);
}

ValueMonitor.prototype.compoundObserve=function(identifier, pathes, changeFn){
  var observer = new _.CompoundObserver();
  var p;
  for(var i=0;i<pathes.length;i++){
    p = pathes[i];
    if(p.indexOf("@:") == 0){//absolute path from scope root
      p = p.substr(2);
    }else{//relative path from current monitor ref path
      p = convertObservePath(this.varRefRoot, p);
    }
    observer.addPath(this.scope, p);
  }
  observer.open(changeFn);
  this.observerMap.add(identifier, identifier, observer);
}

ValueMonitor.prototype.getCompoundValueRef=function(pathes){
  var ps = [];
  var p;
  for(var i=0;i<pathes.length;i++){
    p = pathes[i];
    if(p.indexOf("@:") == 0){//absolute path from scope root
      p = p.substr(2);
    }else{//relative path from current monitor ref path
      p = convertObservePath(this.varRefRoot, p);
    }
    ps[i] = _.Path.get(p);
  }
  var scope = this.scope;
  return {
    setValues : function(values){
      if(values.length != ps.length){
        throw "length not equal for compound value set";
      }
      for(var i=0;i<values.length;i++){
        ps[i].setValueFrom(scope, values[i]);
      }
    },
    getValues : function(){
      var values = [];
      for(var i=0;i<ps.length;i++){
        values[i] = ps[i].getValueFrom(scope);
      }
      return values;
    },
  };
}

ValueMonitor.prototype.discard=function(){
  this.observerMap.discard();
}

module.exports=ValueMonitor;