"use strict";

var constant = require("./constant")

var util = {};

util.sync = function(){
  Platform.performMicrotaskCheckpoint();
};

util.determineRefPath = function (scope, varRef, searchKey) {
  var deleteSearchKey;
  if(searchKey){
    deleteSearchKey = false;
  }else{
    deleteSearchKey = true;
    searchKey = constant.impossibleSearchKey;
    varRef[searchKey] = 1;
  }

  var refPath = null;
  for (var p in scope) {
    var ref = scope[p];
    if (ref[searchKey]) {
      refPath = p;
      break;
    }
  }
  
  if(deleteSearchKey){
    delete varRef[searchKey];
  }

  return refPath;
};

var __uidTimestamp = Date.now();
var __uidSeq = 0;
util.createUID = function () {
  if(__uidSeq >= 1000000){
    __uidTimestamp = Date.now();
    __uidSeq = 0;
  }
  __uidSeq++;
  return "aj-" + __uidSeq + "-"+ __uidTimestamp;
};

//TODO we should keep ref always
util.regulateArray = function (v, tryKeepRef) {
  if ($.isArray(v)) {
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

util.clone = require("../lib/clone");

/**
 * (from)
 * (from, [propList])
 * (from, to)
 * (from, to, [propList])
 */
util.shallowCopy = function(arg1, arg2, arg3){
  var from = arg1;
  var to;
  var props;
  if(Array.isArray(arg2)){
    to = {};
    props = arg2;
  }else{
    to = arg2;
    props = arg3;
  }
  if(!to){
    to = {};
  }
  if(props){
    var p;
    for(var i=0;i<props.length;i++){
      p = props[i];
      to[p] = from[p];
    }
  }else{
    for(var p in from){
      to[p] = from[p];
    }
  }
  
  return to;
};
util.arraySwap = function (array, index1, index2) {
      var tmp = array[index1];
      array[index1] = array[index2];
      array[index2] = tmp;
};
    
util.findWithRoot = function(rootElem, selector){
      if(selector === ":root"){
        return rootElem;
      }
      var result = rootElem.find(selector);
      if(result.length === 0){
        if(rootElem.is(selector)){
          return rootElem;
        }
      }
      return result;
};
  
var __element_ref_map = {};
util.getDataRef = function(jqueryObject, dataAttrName){
  var elementRefId = jqueryObject.attr("aj-element-ref-id");
  if(!elementRefId){
    elementRefId = Aj.util.createUID();
    jqueryObject.attr("aj-element-ref-id", elementRefId);
  }
  var refMap = __element_ref_map[elementRefId];
  if(!refMap){
    refMap = {};
    __element_ref_map[elementRefId] = refMap;
  }
  var dataRef = refMap[dataAttrName];
  if(!dataRef){
    dataRef = {
        _trace_id: Aj.util.createUID()
    };
    refMap[dataAttrName] = dataRef;
  }
  return dataRef;
};

util.replaceIndexesInPath = function(path, replaceIndexes){
  if(replaceIndexes){
    for(var i=0;i<replaceIndexes.length;i++){
      path = path.replace("?", replaceIndexes[i]);
    }
  }
  return path;
}

util.delay=function(callback, timeout, delayMoreCycles){
  if(delayMoreCycles && delayMoreCycles > 0){
    setTimeout(function(){
      util.delay(callback, timeout, delayMoreCycles-1);
    }, 0);
    return;
  }else{
    setTimeout(function(){
      callback.apply();
      util.sync();
    }, timeout ? timeout : 0);
  }
}

module.exports = util;