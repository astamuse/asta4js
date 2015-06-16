"use strict";

var util = require("./util");

var CommonTask = function(rcw){
  this._rcw = rcw;
}

CommonTask.prototype.prepend = function(){
  var array = this._rcw.getArray();
}

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

var getBacktrackingContext=function(context, ignoreBackgroundContext){
  if(context){
    var backtracking =  context._parentContext;
    if(backtracking){
      return backtracking;
    }else if (!ignoreBackgroundContext){
      return context._backgroundContext;
    }
  }else{
    return undefined;
  }
}

var backtrackingArrayContext=function(context, backtracking, ignoreBackgroundContext){
  var tracking = backtracking ? backtracking : 0;
  if(tracking < 0){
    tracking = 0;
  }
  var currentContext = context;
  var lastFoundContext = undefined;
  while(currentContext){
    if(currentContext._boundArray){
      lastFoundContext = currentContext;
      tracking--;
      if(tracking >= 0){
        currentContext = getBacktrackingContext(currentContext, ignoreBackgroundContext);
        continue;
      }else{
        break;
      }
    }else{
      //undefined or null, 0 length is impossible in this case
      //currentContext
      currentContext = getBacktrackingContext(currentContext, ignoreBackgroundContext);
    }
  }
  
  return tracking < 0 ? lastFoundContext : undefined;
}

RenderContextWrapper.prototype.getArray = function(backtracking, ignoreBackgroundContext){
  var trackedContext = backtrackingArrayContext(this._originalContext, backtracking, ignoreBackgroundContext);
  if(trackedContext){
    return trackedContext._boundArray;
  }else{
    return undefined;
  }
}

RenderContextWrapper.prototype.getItem = function(backtracking, ignoreBackgroundContext){
var trackedContext = backtrackingArrayContext(this._originalContext, backtracking, ignoreBackgroundContext);
  if(trackedContext){
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