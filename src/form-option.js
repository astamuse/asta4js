"use strict";

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet")
var normalizeMeta = require("./meta")


var getOptionBindingHub=function(bindContext, identifier){
  var info = bindContext._getResource("optionBindingHub", identifier);
  if(!info){
    info = {};
    bindContext._addResource("optionBindingHub", identifier, info);
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
    var fn = bindContext._optionBindingHub.notifyOptionChanged;
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
  }else if (inputType === "checkbox" || inputType === "radio"){
    if(!targetPropMetaRoot._duplicator){
       throw "_duplicator must be specified for options of checkbox or radio:" + JSON.stringify(targetPropMetaRoot);
    }
    if(!itemDef._selector){
      itemDef._selector = ":root";
    }
    if(itemDef._register_dom_change || itemDef._register_assign || itemDef._assign){
      throw "_register_dom_change/_register_assign/_assign cannot be specified for checkbox/radio option";
    }else{
      itemDef._register_dom_change = function (target, changeHandler, bindContext){
        var optionContext = bindContext._parentContext;
        var optionBindingHub = optionContext._optionBindingHub;
        var changeEvents = optionBindingHub.changeEvents;
        var events = optionBindingHub.changeEvents.join(" ");
        target.find("input").bind(events, function () {
          var je = $(this);
          var value = je.val();
          var checked = je.prop("checked");
          changeHandler({
            "value": value,
            "checked": checked
          }, bindContext);
        });
        //if there is click being bound to input, we do not need to bind any event on label
        //because the click handle will be invoked automatically when the label is clicked.
        if(changeEvents.indexOf("click") < 0){
          target.find("label").bind(events, function(){
            var je= $(this);
            var id = je.attr("for");
            var input = target.find("#" + id);
            var value = input.val();
            //label click may before checkbox "being clicked"
            var checked = !input.prop("checked");
            changeHandler({
              "value": value,
              "checked": checked
            }, bindContext);
          });  
        }
        /*
        
        */
      }
      itemDef._assign = function (changedValue, bindContext) {
        var optionContext = bindContext._parentContext;
        var optionBindingHub = optionContext._optionBindingHub;
        var targetValueRef = optionBindingHub.targetValueRef;
        var inputType = optionBindingHub.inputType;
        
        var value = changedValue.value;
        var checked = changedValue.checked;
        if(inputType === "checkbox"){
          var newResult = util.regulateArray(targetValueRef.getValue());
          var vidx = newResult.indexOf(value);
          if(checked && vidx>= 0){
            //it is ok
          }else if(checked && vidx < 0){
            //add
            newResult.push(value);
          }else if(!checked && vidx >= 0){
            //remove
            newResult.splice(vidx, 1);
          }else{// !checked && vidx < 0
            //it is ok
          }
          targetValueRef.setValue(newResult);
        }else{
          targetValueRef.setValue(value);
        }
      } //_assign
    } // else of (itemDef._register_dom_change || itemDef._assign)
    if (!itemDef._render) {
      itemDef._render = function (target, newValue, oldValue, bindContext) {
        var optionContext = bindContext._parentContext;
        var optionBindingHub = optionContext._optionBindingHub;
        var snippet = bindContext._snippet;
        var uid = util.createUID();
        snippet.find(":root").attr("aj-option-binding", optionBindingHub.optionId);
        snippet.find("input[type="+optionBindingHub.inputType+"]").attr("id", uid).val(valueFn(newValue));;
        snippet.find("label").attr("for", uid).text(textFn(newValue));
      };
    }
  }//end checkbox or radio
  return normalizeMeta(newMeta);

}//end optionRewrite

module.exports={
  rewriteOptionMeta : rewriteOptionMeta,
  getOptionBindingHub : getOptionBindingHub
}

