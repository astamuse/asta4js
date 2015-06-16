"use strict";

var arrayUtil = {};

arrayUtil.swap = function (array, index1, index2) {
      var tmp = array[index1];
      array[index1] = array[index2];
      array[index2] = tmp;
};

arrayUtil.arrayLengthAdjust = function (targetArray, hopeLength, initialNewFn, discardCutFn) {
  var existingLength = targetArray.length;
  if(initialNewFn){
    var newItem;
    for(var i=existingLength;i<hopeLength;i++){
      newItem = initialNewFn(i);
      targetArray[i] = newItem;
    }
  }else{
    for(var i=existingLength;i<hopeLength;i++){
      targetArray[i] = undefined;
    }
  }
  var removeCount = existingLength - hopeLength;
  if(removeCount > 0){
    if(discardCutFn){
      for(var i=hopeLength;i<existingLength;i++){
        discardCutFn(targetArray[i], i);
      }
    }
    targetArray.splice(hopeLength, removeCount);
  }
};

//TODO we should keep ref always
arrayUtil.regulateArray = function (v, tryKeepRef) {
  if (Array.isArray(v)) {
    if(tryKeepRef){
      return v;
    }else{
      return [].concat(v);
    }
  } else if (v === null || v === undefined) {
    return new Array();
  } else {
    return [v];
  }
};

arrayUtil.commonEventTask = {
  
  prepend: function(targetElement, data){
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    if(Array.isArray(array)){
      array.unshift(data);
      return true;
    }else{
      return false;
    }
  },
  
  append: function(targetElement, data){
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    if(Array.isArray(array)){
      array.push(data);
      return true;
    }else{
      return false;
    }
  },
  
  before: function(targetElement, data){
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    var index = context.getIndex();
    if(Array.isArray(array)){
      array.splice(index, 0, data);
      return true;
    }else{
      return false;
    }
  },
  
  after: function(targetElement, data){
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    var index = context.getIndex();
    if(Array.isArray(array)){
      array.splice(index + 1, 0, data);
      return true;
    }else{
      return false;
    }
  },
  
  remove: function(targetElement){
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    var index = context.getIndex();
    if(Array.isArray(array)){
      array.splice(index, 1);
      return true;
    }else{
      return false;
    }
  },
  
  moveUp: function(targetElement, step){
    var s = step === undefined ? 1: step;
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    var index = context.getIndex();
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
  
  moveDown: function(targetElement, step){
    var s = step === undefined ? 1: step;
    var context = Aj.getContext(targetElement);
    var array = context.getArray();
    var index = context.getIndex();
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
};

arrayUtil.cet = arrayUtil.commonEventTask;

module.exports = arrayUtil;