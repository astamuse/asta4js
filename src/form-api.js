"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var transformers = require("./transformers");
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
 * [target]: string->name or selector. object->{name: ""} or {selector: ""}
 * [event1]: string->default change event array->extra change events
 * [event2]: array->extra change events
 */
api.form = function(target, event1, event2){
  var selector;
  var name;
  if(target){
    if(typeof target === "string"){
      //treat as name or selector
      selector = "[name='"+target+"']"+ ", " + target;
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
      extraChangeEvents = event1;
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
  
  _extendFormMetaApi(ret);

  return ret;
}

var _formMetaApiExtending = [];

var _extendFormMetaApi = function(formMeta){
  var len = _formMetaApiExtending.length;
  for(var i=0;i<len;i++){
    var apis = _formMetaApiExtending[i];
    util.shallowCopy(apis, formMeta);
  }
}

var _addMetaApiExtending = function(apis){
  for(var p in apis){
    if(!apis[p]["nonMeta"]){
      apis[p]["nonMeta"] = true;
    }
  }
  _formMetaApiExtending.push(apis);
};


// adjust to millisecond unit
var _default_tz_offset = (new Date()).getTimezoneOffset() * 60 * 1000;

// add default form meta api extending
_addMetaApiExtending({
  
  asSingleCheck : function(){
    this._form._single_check = true;
    return this;
  },
  
  withOption : function(){
    this._form._option = api.optionBind.apply(Aj, arguments);
    return this;
  },
  
  transform : function(transform){
    this._transform = transform;
    return this;
  },
  
  asInt : function(radix){
    this._transform = transformers["int"](radix);
    return this;
  },
  
  asFloat : function(){
    this._transform = transformers["float"]();
    return this;
  },
  
  asDatetime : function(option){
    var op = option ? util.shallowCopy(option) : {};
    //the default form transformer will try to deal with html5 datetime-local input, so we need to customize the transform option
    if(op._parse_tz_offset === undefined){
      op._parse_tz_offset = _default_tz_offset;
    }
    if(op._stringy_tz_offset === undefined){
      op._stringy_tz_offset = _default_tz_offset;
    }
    this._transform = transformers["datetime"](op);
    return this;
  },
  /**
   * (limit)
   * (format)
   * (limit, format)
   * (format, limit)
   * ({
   *  _file_preload_limit:
   *  _file_preload_format:
   * }),
   * ({
   *  limit:
   *  format:
   * })
   */
  fileOption: function(op1, op2){
    var limit;
    var format;
    if(op1 === undefined){//&& op2 === undefined
      //do nothing
    }else if(op2 === undefined){
      var type = typeof op1;
      if(type === "number"){
        limit = op1;
      }else if (type === "string"){
        format = op1;
      }else if (type == "object"){
        limit = op1["_file_preload_limit"];
        format = op1["_file_preload_format"];
        if(limit === undefined){
          limit = op1["limit"];
        }
        if(format === undefined){
          format = op1["format"];
        }
        if(limit === undefined && format === undefined){
          console.error("unrecognised option:", op1);
        }
      }
    }else{
      //op1 && op2
      var type1 = typeof op1;
      var type2 = typeof op2;
      if(type1 === "number" && type2 === "string"){
        limit = op1;
        format = op2;
      }else if(type1 === "string" && type2 === "number"){
        limit = op2;
        format = op1;
      }else{
        console.error("unrecognised option:", op1, op2);
      }
    }
    this._form._file_preload_limit = limit;
    this._form._file_preload_format = format;
    return this;
  },
  override: function(obj){
    util.override(obj, this);
    return this;
  }
  
});

api.form.addMetaApiExtending = _addMetaApiExtending;

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


