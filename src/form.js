"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var arrayUtil=require("./arrayUtil");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet")

var BindContext = require("./bind-context")
var ValueMonitor = require("./value-monitor")

var optionUtil = require("./form-option")

var $ = config.$;

var getInputType=function(jq){
  var inputType;
  var tagName = jq.prop("tagName");
  if(tagName === "INPUT"){
    inputType = jq.attr("type");
    if(inputType){
      inputType = inputType.toLowerCase();
    }
  }else if(tagName === "SELECT"){
    inputType = "select";
  }
  return inputType;
}

var combinedChangeEvents = function(formDef, inputType){
  var changeEvents = new Array();

  var defaultChangeEvent = formDef._default_change_event;
  if (defaultChangeEvent === undefined) {
    if(inputType === "checkbox" || inputType === "radio"){
      changeEvents.push("click");
    }else{
      changeEvents.push("change");
    }
  } else if (defaultChangeEvent) {
    changeEvents.push(defaultChangeEvent);
  }

  var extraChangeEvents = formDef._extra_change_events;
  extraChangeEvents = arrayUtil.regulateArray(extraChangeEvents);
  Array.prototype.push.apply(changeEvents, extraChangeEvents);
  return changeEvents;
}

var defaultFormRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
  if(target.val() != newValue){
    target.val(newValue);
  }
}

var defaultFormRegisterDomChange = function(meta, formDef, inputType, target, changeHandler, bindContext){
  target.bind(combinedChangeEvents(formDef, inputType).join(" "), function () {
    var v = $(this).val();
    changeHandler(v, bindContext);
  });
}

var selectRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
  //move diverge value option at first
  target.find("[aj-diverge-value]").remove();
  
  var va = arrayUtil.regulateArray(newValue);
  if(!target.prop("multiple") && va.length == 0){
    //single select with 0 length value array means we have a undefined/null/empty value
    va[0] = "";
  }
  var unmatchedValue = [];
  var v;
  for(var i=0;i<va.length;i++){
    v = va[i];
    if(v === null || v === undefined){
      v = "";
    }
    var foundOption = target.find("option[value='"+v+"']");
    if(foundOption.length === 0){
      unmatchedValue.push(v);
    }else{
      foundOption.prop("selected", true);
    }
  }
  if(unmatchedValue.length > 0){
    for(var i=0;i<unmatchedValue.length;i++){
      var op = $("<option aj-diverge-value selected>").val(newValue).text(newValue);
      target.prepend(op);
    }
  }
}


var selectRegisterDomChange = function(meta, formDef, inputType, target, changeHandler, bindContext){
    //just for register option binding info
    
    var optionSnippet = new Snippet(target);
    bindContext._addDiscardHook(function(){
      optionSnippet._discard();
    });
    
    var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
    optionBindingHub.optionSnippet = optionSnippet;

    defaultFormRegisterDomChange(meta, formDef, inputType, target, changeHandler, bindContext);
}


var checkboxOrRadioRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
  if(formDef._single_check){
    if(newValue){
      target.prop("checked", true);
    }else{
      target.prop("checked", false);
    }
  }else{
    var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
    var va = arrayUtil.regulateArray(newValue);
    if(inputType === "radio" && va.length > 1){
      throw "There are over than one candidate value for radio:" + va;
    }
    var unmatchedValue = [];
    var optionId = optionBindingHub.optionId;
    
    if(!optionId){//option bind has not been called yet
      return;
    }
    
    var snippet = bindContext._snippet;
    
    //remove the auto generated diverge elements
    snippet.find("[aj-diverge-value=" + optionId + "]").remove();
    
    //find out all the existing options
    var ops = snippet.find("[aj-option-binding=" + optionId + "]");
    //set all to false at first
    util.findWithRoot(ops, "input[type="+inputType+"]").prop("checked", false);
    va.forEach(function(v){
      if(v === null || v === undefined){
        v = "";
      }
      var foundInput = util.findWithRoot(ops, "input[value='"+v+"']");
      if(foundInput.length === 0){
        if(v){
          unmatchedValue.push(v);
        }
      }else{
        foundInput.prop("checked", true);
      }
    });
    if(unmatchedValue.length > 0){
      //there must be "aj-placeholder-id"
      var placeHolderId = target.attr("aj-placeholder-id");
      var insertPoint = snippet.find("#" + placeHolderId);
      unmatchedValue.forEach(function(v){
        var uid = util.createUID();
        var input = target.clone().attr("id", uid).val(v).prop("checked", true);
        var label = $("<label>").attr("for",uid).text(v);
        
        var diverge = $("<span>").attr("aj-diverge-value", optionId);
        diverge.append(input).append(label);
        
        insertPoint.after(diverge);
      });
    }
  }
}

var checkboxOrRadioRegisterDomChange = function(meta,formDef, inputType, target, changeHandler, bindContext){
  var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
  var changeEvents = combinedChangeEvents(formDef, inputType);
  if(formDef._single_check){
    target.bind(changeEvents.join(" "), function () {
      var v = $(this).prop("checked");
      changeHandler(v, bindContext);
    }); 
  }else{
    optionBindingHub.optionId = util.createUID();
    optionBindingHub.targetValueRef = bindContext._valueMonitor.getValueRef(meta._target_path);
    optionBindingHub.changeEvents = changeEvents;
  }
}

var fileRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
  //do nothing since we cannot do anything on a file input
}

var _file_preload_format_convience = {
  "arraybuffer": "ArrayBuffer",
  "binarystring": "BinaryString",
  "dataurl": "DataURL",
  "text": "Text",
  "base64": "DataURL",
};

var FileReadCounter = function(size, callback){
  this.counter = 0;
  this.size = size;
  this.callback = callback;
}

FileReadCounter.prototype.inc = function(){
  this.counter++;
  if(this.counter>= this.size){
    this.callback.apply();
  }
}

var fileRegisterDomChange = function(meta, formDef, inputType, target, changeHandler, bindContext){
  var limit = formDef._file_preload_limit;
  if(limit === undefined){
    //default value is 10M
    limit = 10 * 1000 * 1000;
  }
  var format = formDef._file_preload_format;
  if(format){
    format = format.toLowerCase();
  }else{
    format = "base64"
  }
  var targetFileApi = _file_preload_format_convience[format];
  if(!targetFileApi){
    format = "base64";
    targetFileApi = "DataURL";
  }
  targetFileApi = "readAs" + targetFileApi;
  target.bind(combinedChangeEvents(formDef, inputType).join(" "), function () {
    var files = new Array();
    for(var i=0;i<this.files.length;i++){
      files[i] = this.files[i];
    }
    if(limit > 0){
      var counter = new FileReadCounter(files.length, function(){
        var v = target.prop("multiple") ? files : files[0];
        changeHandler(v, bindContext);
      });
      files.forEach(function(f){
          if(f.size > limit){
            counter.inc();
          }else{
            var reader = new FileReader();
            reader.onload= function(e){
              var content = reader.result;
              if(format === "base64"){
                var index = content.indexOf("base64,");
                content = content.substr(index+7);
              }
              f.content = content;
              counter.inc();
            };
            reader[targetFileApi](f);
          }
      });
    }else{
      var v = target.prop("multiple") ? files : files[0];
      changeHandler(v, bindContext);
    }
  });
}

var findTypedHandler=function(handlerMap, inputType){
  var fn = handlerMap[inputType];
  if(fn){
    return fn;
  }else{
    return handlerMap["__default__"];//must have
  }
}

var optionMetaCache = {};

var _form = function (meta) {
  var formDef = meta._form;
  var propertyPath = meta._target_path;
  
  if (typeof formDef === "string") {
    formDef = {
      _name : formDef
    };
  }
  
  if(!formDef._name){
    var lastDotIndex = propertyPath.lastIndexOf(".");
    formDef._name = propertyPath.substr(lastDotIndex+1);
  }

  if (!meta._selector) {
    meta._selector = "[name='" + formDef._name + "']";
  }
  
  // init option bind hub
  /*
  meta._pre_binding.push(function(bindContext){
    
  });
  */

  if (!meta._render) {
    meta._render = function (target, newValue, oldValue, bindContext) {
      var inputType = getInputType(target);
      var handler = findTypedHandler(config.meta.typedFormHandler._render, inputType);
      handler(meta, formDef, inputType, target, newValue, oldValue, bindContext);
    };
  } 

  if (!meta._register_dom_change) {
    meta._register_dom_change = function (target, changeHandler, bindContext) {
      var inputType = getInputType(target);
      var handler = findTypedHandler(config.meta.typedFormHandler._register_dom_change, inputType);
      
      var optionBindingHub;
      if(inputType && !formDef._single_check){
        optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
        optionBindingHub.inputType = inputType;
      }
      
      handler(meta, formDef, inputType, target, changeHandler, bindContext);
    }
  }
  
  if (formDef._option) {
    var varPath = formDef._option._var_path;
    var varRef = formDef._option._var_ref;
    var varRefSearchKey = formDef._option._var_ref_search_key;
    delete formDef._option._var_path;
    delete formDef._option._var_ref;
    delete formDef._option._var_ref_search_key;
    optionMetaCache[meta._meta_trace_id] = {
      varPath: varPath,
      varRef: varRef,
      varRefSearchKey: varRefSearchKey,
      optionMeta: undefined
    };
    meta._post_binding.push(function (bindContext) {
      var scope = bindContext._valueMonitor.scope;
      var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);//must have
      
      var cachedOptionMetaInfo = optionMetaCache[meta._meta_trace_id];
      var varPath = cachedOptionMetaInfo.varPath;
      var optionMeta = cachedOptionMetaInfo.optionMeta;

      if(!varPath){
        varPath = util.determineRefPath(scope, cachedOptionMetaInfo.varRef, cachedOptionMetaInfo.varRefSearchKey);
        cachedOptionMetaInfo.varPath = varPath;
        
        delete varRef[varRefSearchKey];
        delete scope[varPath][varRefSearchKey];
        delete cachedOptionMetaInfo.varRef;
        delete cachedOptionMetaInfo.varRefSearchKey;
      }
      
      if(!optionMeta){
        optionMeta = optionUtil.rewriteOptionMeta(formDef._option, optionBindingHub.inputType);
        cachedOptionMetaInfo.optionMeta = optionMeta;
      }
      
      optionBindingHub.notifyOptionChanged=function(){
        bindContext._forceSyncFromObserveTarget(meta._meta_trace_id);
      };

      var optionMonitor = new ValueMonitor(scope, varPath);
      var snippet = optionBindingHub.optionSnippet ? optionBindingHub.optionSnippet : bindContext._snippet;
      
      bindContext.asBackground(function(){
        var optionContext = new BindContext({
          _valueMonitor: optionMonitor,
          _snippet: snippet,
          _optionBindingHub: optionBindingHub,
          _inputTargetBindContext: bindContext,
        });
        optionContext._bind(optionMeta);
      })

    });
  }
}

config.meta.rewritterMap["_form"] = {
  priority : constant.metaRewritterPriority["_form"],
  fn : _form
};

config.meta.typedFormHandler._render["__default__"] = defaultFormRender;
config.meta.typedFormHandler._render["select"] = selectRender;
config.meta.typedFormHandler._render["checkbox"] = checkboxOrRadioRender;
config.meta.typedFormHandler._render["radio"] = checkboxOrRadioRender;
config.meta.typedFormHandler._render["file"] = fileRender;

config.meta.typedFormHandler._register_dom_change["__default__"] = defaultFormRegisterDomChange;
config.meta.typedFormHandler._register_dom_change["select"] = selectRegisterDomChange;
config.meta.typedFormHandler._register_dom_change["checkbox"] = checkboxOrRadioRegisterDomChange;
config.meta.typedFormHandler._register_dom_change["radio"] = checkboxOrRadioRegisterDomChange;
config.meta.typedFormHandler._register_dom_change["file"] = fileRegisterDomChange;

