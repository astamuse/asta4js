"use strict";

var _ = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var ResourceMap = require("./resource-map");

var ValueMonitor=function(scope, varRefRoot){
  this.scope = scope;
  this.varRefRoot = varRefRoot;
  this.observerMap = new ResourceMap();
  this.virtualMonitorMap = new ResourceMap();
}

var concatPath = function(p1, p2){
  var path;
  if(p1){
    path = p2 ? p1 + "." + p2 : p1;
  }else{
    path = p2;
  }
  //fix the n-dimensions array path
  path = path.replace(".[", "[");
  return path;
}

var convertObservePath=function(rootPath, subPath){
  var observePath = concatPath(rootPath, subPath);
  if(!observePath){
      throw "The scope root cannot be observed";
  }
  //fix the n-dimensions array path
  observePath = observePath.replace(".[", "[");
  
  var parts = observePath.split(".");
  var safePath = "";
  var arrayReg = /(\[[0-9]+\])+/
  var match;
  var p;
  for(var i=0;i<parts.length;i++){
    p = parts[i];
    match = arrayReg.exec(p);
    if(match){
      p = p.substring(0, match.index)
      if(p){
        safePath += "['" + p + "']";
      }
      safePath += match[0];
    }else{
      if(p){
        safePath += "['" + p + "']";
      }
    }
  }
  
  return safePath;
}

ValueMonitor.prototype.getVirtualMonitor=function(virtualRootPath){
  var k = virtualRootPath ? virtualRootPath : "__virtual_root__7uhanjdsf9";
  var vm = this.virtualMonitorMap.get("vm", k);
  if(!vm){
    vm = new ValueMonitor({
      __id__: util.createUID()
    }, "__vs__");
    this.virtualMonitorMap.add("vm", k, vm);
  }
  return vm;
}

ValueMonitor.prototype.createSubMonitor=function(subPath){
   var observePath = concatPath(this.varRefRoot, subPath);
  return new ValueMonitor(this.scope, observePath);
};

ValueMonitor.prototype.pathObserve=function(identifier, subPath, changeFn, transform){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var observer = new _.PathObserver(this.scope, observePath);
  if(transform){
    observer.open(function(newValue, oldValue){
      changeFn(
        transform._get_value(newValue),
        transform._get_value(oldValue)
      );
    });
  }else{
    observer.open(changeFn);
  }
  this.observerMap.add(observePath, identifier, observer);
}

function setValueWithSpawn(ref, path, value, pathPartIndex){
  var index;
  if(pathPartIndex === undefined){
    index = 0;
  }else{
    index = pathPartIndex;
  }
  
  if(index == path.length -1){
    ref[path[index]] = value;
  }else{
    if(!ref[path[index]]){
      ref[path[index]] = {};
    }
    setValueWithSpawn(ref[path[index]], path, value, index+1);
  }

}

ValueMonitor.prototype.getValueRef=function(subPath, transform){
  var observePath = convertObservePath(this.varRefRoot, subPath);
  var path = _.Path.get(observePath);
  var scope = this.scope;
  return {
    setValue : function(v, spawnUnreachablePath){
      var tv = transform ? transform._set_value(v) : v;
      var success = path.setValueFrom(scope, tv);
      if(!success){//unreachable path
          var spawn = spawnUnreachablePath;
          if(spawn === undefined){
            spawn = true; //default to generate all necessary sub path
          }
          if(spawn){
            setValueWithSpawn(scope, path, tv);
          }
      }
    },
    getValue : function(){
      var v = path.getValueFrom(scope);
      return transform ? transform._get_value(v) : v;
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
  this.virtualMonitorMap.discard();
}

module.exports=ValueMonitor;