"use strict";

var util = require("./util");

var canFastReturn=function(assistant, backtracking){
  return !(assistant._backtrackingToBackground || backtracking);
}

var getBacktrackingArrayInfo=function(assistant, backtracking){
  var tracking = backtracking ? backtracking : 0;
  if(tracking < 0){
    tracking = 0;
  }
  
  var trackedInfo = assistant._backtrackingArrayInfo[tracking];
  if(trackedInfo){
    //we found cached info, it is ok
  }else{
    //then we have to retrieve it
    var currentContext = trackedInfo ? trackedInfo._context : assistant._originalContext;
    var lastFoundContext = undefined;
    var indexes = [];
    var trackingCounter = tracking;
    while(currentContext){
      if(currentContext._boundArray){
        indexes.unshift(currentContext._arrayIndex);
        lastFoundContext = currentContext;
        trackingCounter--;
        if(trackingCounter >= 0){
          currentContext = getBacktrackingContext(currentContext, assistant._backtrackingToBackground);
          continue;
        }else{
          break;
        }
      }else{
        //undefined or null, 0 length is impossible in this case
        //currentContext
        currentContext = getBacktrackingContext(currentContext, assistant._backtrackingToBackground);
      }
    }
    trackedInfo = {
      _context: lastFoundContext,
      _indexes: indexes,
      _out_of_tracking: trackingCounter >= 0,
    };
    assistant._backtrackingArrayInfo[tracking] = trackedInfo;
  }
  return trackedInfo;
}

var getBacktrackingContext=function(context, backtrackingToBackground){
  if(context){
    var backtracking =  context._parentContext;
    if(backtracking){
      return backtracking;
    }else if (backtrackingToBackground){
      return context._backgroundContext;
    }
  }else{
    return undefined;
  }
}

var BindContextArrayAssistant = function(bindContext, backtrackingToBackground){
  this._originalContext = bindContext;
  this._backtrackingToBackground = backtrackingToBackground;
  this._backtrackingArrayInfo = {};
}

BindContextArrayAssistant.prototype.getIndex = function(backtracking){
  if(canFastReturn(this, backtracking)){
    return this._originalContext._arrayIndex;
  }
  
  var arrayInfo = getBacktrackingArrayInfo(this, backtracking);
  if(arrayInfo._context){
    var adjust = backtracking === undefined ? 0 : backtracking;
    return arrayInfo._indexes[arrayInfo._indexes.length-adjust-1];
  }else{
    return undefined;
  }
}

BindContextArrayAssistant.prototype.getIndexes = function(backtracking){
  if(canFastReturn(this, backtracking)){
    return this._originalContext._arrayIndexes;
  }
  
  //we use an impossible backtracking cycle to retrieve all
  var arrayInfo = getBacktrackingArrayInfo(this, backtracking === undefined ? 1000 : backtracking);
  if(arrayInfo._context){
    return arrayInfo._indexes;
  }else{
    return undefined;
  }
}

BindContextArrayAssistant.prototype.getArray = function(backtracking){
  if(canFastReturn(this, backtracking)){
    return this._originalContext._boundArray;
  }
  
  var arrayInfo = getBacktrackingArrayInfo(this, backtracking);
  if(arrayInfo._out_of_tracking || !arrayInfo._context){
    return undefined;
  }else{
    return arrayInfo._context._boundArray;
  }
  
}

BindContextArrayAssistant.prototype.getItem = function(backtracking){
  var array = this.getArray(backtracking);
  var index = this.getIndex(backtracking);
  if(array === undefined || index === undefined){
    return undefined;
  }else{
    return array[index];
  }
}

//common event tasks here

BindContextArrayAssistant.prototype.prepend=function(data){
  var array = this.getArray();
  if(Array.isArray(array)){
    array.unshift(data);
    return true;
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.append=function(data){
  var array = this.getArray();
  if(Array.isArray(array)){
    array.push(data);
    return true;
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.before=function(data){
  var array = this.getArray();
  var index = this.getIndex();
  if(Array.isArray(array)){
    array.splice(index, 0, data);
    return true;
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.after=function(data){
  var array = this.getArray();
  var index = this.getIndex();
  if(Array.isArray(array)){
    array.splice(index + 1, 0, data);
    return true;
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.remove=function(){
  var array = this.getArray();
  var index = this.getIndex();
  if(Array.isArray(array)){
    array.splice(index, 1);
    return true;
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.moveUp=function(step){
  var s = step === undefined ? 1: step;
  var array = this.getArray();
  var index = this.getIndex();
  if(Array.isArray(array)){
    if(s > 0 && index > 0){
      var tmp = array[index];
      while(s > 0 && index > 0){
        array[index] = array[index - 1];
        s--;
        index--;
      }
      array[index] = tmp;
    }
  }else{
    return false;
  }
},

BindContextArrayAssistant.prototype.moveDown=function(step){
  var s = step === undefined ? 1: step;
  var array = this.getArray();
  var index = this.getIndex();
  if(Array.isArray(array)){
    var maxIndex = array.length - 1;
    if(s > 0 && index < maxIndex){
      var tmp = array[index];
      while(s > 0 && index < maxIndex){
        array[index] = array[index + 1];
        s--;
        index++;
      }
      array[index] = tmp;
    }
  }else{
    return false;
  }
},

module.exports=BindContextArrayAssistant