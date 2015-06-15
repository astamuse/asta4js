"use strict";

var util = require("./util");

var WrapperMap = {};

var RenderContextWrapper = function(bindContext){
  this._identifier = util.createUID();
  this._originalContext = bindContext;
  WrapperMap[this._identifier] = this;
}

RenderContextWrapper.prototype._discard = function(){
  delete WrapperMap[this._identifier];
}

RenderContextWrapper.prototype.getIndex = function(){
  return this._originalContext._arrayIndex;
}

RenderContextWrapper.prototype.getIndexes = function(){
  if(this._arrayIndexes === undefined){
    this._arrayIndexes = util.clone(this._originalContext._arrayIndexes);
  }
  return this._arrayIndexes;
}

var backtrackingArrayContext=function(context, backtracking){
  var tracking = backtracking ? backtracking : 0;
  var currentContext = context;
  var lastFoundContext = undefined;
  while(currentContext){
    if(currentContext._boundArray){
      lastFoundContext = currentContext;
      if(tracking > 0){
        currentContext = currentContext._parentContext;
        tracking--;
        continue;
      }else{
        break;
      }
    }else{
      //undefined or null, 0 length is impossible in this case
      //currentContext
      currentContext = currentContext._parentContext;
    }
  }
  return lastFoundContext;
}

RenderContextWrapper.prototype.getArray = function(backtracking){
  var trackedContext = backtrackingArrayContext(this._originalContext, backtracking);
  if(trackedContext){
    return trackedContext._boundArray;
  }else{
    return undefined;
  }
}

RenderContextWrapper.prototype.getItem = function(backtracking){
  var trackedArray = this.getArray(backtracking);
  if(trackedArray){
    return trackedContext._boundArray[trackedContext._arrayIndex];
  }else{
    return undefined;
  }
}

module.exports={
  get: function(arg){
    if(typeof arg === "string"){//by identifier
      return WrapperMap[arg];
    }else{//as context
      var wrapper = arg._getResource("RenderContextWrapper", "RenderContextWrapper");
      if(wrapper){
        // it is ok
      }else{
        wrapper = new RenderContextWrapper(arg);
        arg._addResource("RenderContextWrapper", "RenderContextWrapper", wrapper);
      }
      return wrapper;
    }
  }
};