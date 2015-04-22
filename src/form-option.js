"use strict";

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet")
var normalizeMeta = require("./meta")


var getOptionBindingHub=function(bindContext, identifier){
  var info = bindContext.getResource("optionBindingHub", identifier);
  if(!info){
    info = {};
    bindContext.addResource("optionBindingHub", identifier, info);
  }
  return info;
}

var throwMalformedOptionMeta=function(meta){
  throw "There must be one property or a pair of _duplicator/_item (_item is ignorable) to be declared for option binding, but got:"
        + JSON.stringify(meta);
}
var retrieveTargetPropMetaRoot=function(meta){
  var checkKeys = Object.keys(meta);
  if (checkKeys.length == 0) {
    return meta;
  }else if(checkKeys.length == 1){
    if(checkKeys[0] === "_duplicator"){
      return meta;
    }else if(checkKeys[0] === "_item"){
      return meta;
    }else{
      return retrieveTargetPropMetaRoot(meta[checkKeys[0]]);
    }
  }else if(checkKeys.length == 2){
    if(checkKeys.indexOf("_duplicator") && checkKeys.indexOf("_item")){
      return meta;
    }else{
      throwMalformedOptionMeta(meta);
    }
  }else{
    throwMalformedOptionMeta(meta);
  }
}

var defaultValueFn=function (v){
  if(v.value === undefined){
    return v;
  }else{
    return v.value;
  }
}

var defaultTextFn=function(v){
  if(v.text === undefined){
    return v;
  }else{
    return v.text;
  }
};

/*
 * 
 */
var rewriteOptionMeta=function(optionMeta, inputType){
  var newMeta = util.clone(optionMeta);
  var targetPropMetaRoot = retrieveTargetPropMetaRoot(newMeta);
  if(!targetPropMetaRoot._item){
    targetPropMetaRoot._item = {};
  }
  
  targetPropMetaRoot._value = function(newValue, oldValue, bindContext){
    var fn = bindContext.optionBindingHub.notifyOptionChange;
    if(fn){
      //delay it 3 delay cycle to make sure all the necessary change handlers related to option has finished.
      util.delay(fn, 0, 3);
    }
  }
  
  //TODO we should handle splice but not now
  /*
  targetPropMetaRoot._splice = function(newValue, oldValue, bindContext){
    var fn = bindContext.optionBindingHub.notifyOptionChange();
    if(fn){
      fn.apply();
    }
  }
  */
  
  var itemDef = targetPropMetaRoot._item;
  
  var valueFn = itemDef._value ? itemDef._value : defaultValueFn;
  delete itemDef._value;

  var textFn = itemDef._text ? itemDef._text : defaultTextFn;
  delete itemDef._text;
  
  if(inputType === "select"){
    if(!targetPropMetaRoot._duplicator){
      targetPropMetaRoot._duplicator = "option:first";
    }
    if(!itemDef._selector){
      itemDef._selector = ":root";
    }
    if (!itemDef._render) {
      itemDef._render = function (target, newValue, oldValue, bindContext) {
        target.val(valueFn(newValue));
        target.text(textFn(newValue));
      };
    }
  }
  return normalizeMeta(newMeta);

}//end optionRewrite

module.exports={
  rewriteOptionMeta : rewriteOptionMeta,
  getOptionBindingHub : getOptionBindingHub
}

