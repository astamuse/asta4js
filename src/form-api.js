"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet")

var api={};

/**
 * _varRef : binding reference
 * _meta   : option meta or target binding property name
 * _meta2  : _duplicator
 */
api.optionBind = function (_varRef, _meta, _meta2) {
  var meta;
  if (typeof _meta === "string") {
    meta = {};
    meta[_meta] = {};
  } else {
    meta = util.clone(_meta);
  }
  
  if(typeof _meta2 === "string"){
    for(var kk in meta){
      meta[kk]._duplicator = _meta2;
    }
  }
  
  var searchKey = constant.impossibleSearchKey + "-option-bind-trick-" + util.createUID();
  _varRef[searchKey] = 1;
  
  meta._var_ref = _varRef;
  meta._var_ref_search_key = searchKey;
  
  return meta;
}, //end optionBind

/**
 * [target]: string->name or selector. object->{_name: ""} or {_selector: ""}
 * [event1]: string->default change event array->extra change events
 * [event2]: array->extra change events
 */
api.form = function(target, event1, event2){
  var selector;
  var name;
  if(target){
    if(typeof target === "string"){
      //treat as name or selector
      selector = "[name="+target+"]"+ ", " + target;
    }else{
      selector = target["selector"];
      name = target["name"];
    }
  }
  var ret = {
    _selector: selector,
    _form: {
      _name: name
    }
  };
  var defaultChangeEvent;
  var extraChangeEvents;
  if(event1){
    if(typeof event1 === "string"){
      defaultChangeEvent = event1;
      extraChangeEvents = event2;
    }else if (Array.isArray(event1)){
      extraChangeEvents = event2;
    }
  }else{
    //the client may call me as ({}, null, ["xxx"]), so the event1 is null but event2 exists
    if(event2){
      extraChangeEvents = event2;
    }
  }

  
  if(defaultChangeEvent){
    ret._form._default_change_event = defaultChangeEvent;
  }
  ret._form._extra_change_events = extraChangeEvents;
  
  ret.withOption = function(){
    this._form._option = api.optionBind.apply(Aj, arguments);
    return this;
  }
  ret.asSingleCheck = function(){
    this._form._single_check = true;
    return this;
  }
  
  ret.withOption.nonMeta = true;
  ret.asSingleCheck.nonMeta = true;

  return ret;
}
api.form.singleCheck=function(){
  var ret = api.form.apply(this, arguments);
  ret._form._single_check = true;
  return ret;
}

/*
form.optionText=function(optionData, targetField, convertFns){
  return null;
}
*/

api.form.optionText=function(optionData, searchValue, convertFns){
  if(!Array.isArray(optionData)){
    return undefined;
  }
  var valueArray;
  if(Array.isArray(searchValue)){
    valueArray = searchValue;
  }else{
    valueArray = [searchValue];
  }
  var searchValueFn, valueFn, textFn;
  if(convertFns){
    searchValueFn = convertFns._search;
    valueFn = convertFns._value;
    textFn = convertFns._text;
  }
  if(!valueFn){
    valueFn = function(v){
      if(v.value === undefined){
        return v;
      }else{
        return v.value;
      }
    };
  }
  if(!textFn){
    textFn = function(v){
      if(v.text === undefined){
        return v;
      }else{
        return v.text;
      }
    };
  }
  var resultArray = [];
  for(var i=0;i<valueArray.length;i++){
    var sv = valueArray[i];
    for(var j=0;j<optionData.length;j++){
      if(valueFn(optionData[j]) == sv){
        resultArray.push(textFn(optionData[j]));
        break;
      }
    }
    resultArray.push(undefined);
  }
  
  if(Array.isArray(searchValue)){
    return resultArray;
  }else{
    return resultArray[0];
  }
}

module.exports=api;


