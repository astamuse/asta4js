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

module.exports = arrayUtil;