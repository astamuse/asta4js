var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet")

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
    meta._selector = "[name=" + formDef._name + "]";
  }

  if (!meta._render) {
    meta._render = function (target, newValue, oldValue, bindContext) {
      //TODO we need to do more for select/checkbox/radio
      var tagName = target.prop("tagName");
      switch (tagName) {
      case "SELECT":
        //move diverge value option at first
        target.find("[aj-diverge-value]").remove();
        target.val(newValue);
        var domValue = target.val();
        if (domValue === null) { //which means there is no corresponding option
          var op = $("<option aj-diverge-value>").val(newValue).text(newValue);
          target.append(op);
          target.val(newValue);
        }
        break;
      case "INPUT":
        var type = target.attr("type");
        if(type){
          type = type.toLowerCase();
        }
        if(type === "checkbox" || type === "radio"){
          if(formDef._single_check){
            if(newValue){
              target.prop("checked", true);
            }else{
              target.prop("checked", false);
            }
          }else{
            var va = util.regulateArray(newValue);
            if(type === "radio" && va.length > 1){
              throw "There are over than one candidate value for radio:" + va;
            }
            var unmatchedValue = [];
            //there must be "aj-placeholder-id"
            var placeHolderId = target.attr("aj-placeholder-id");
            
            if(!placeHolderId){//option bind has not been called yet or static option
              return;
            }
            
            var snippet = bindContext._snippet;
            
            //remove the auto generated diverge elements
            snippet.find("[aj-diverge-value=" + placeHolderId + "]").remove();
            
            //find out all the existing options
            var ops = snippet.find("[aj-generated=" + placeHolderId + "]");
            util.findWithRoot(ops, "input[type="+type+"]").prop("checked", false);
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
              var insertPoint = snippet.find("#" + placeHolderId);
              unmatchedValue.forEach(function(v){
                var uid = util.createUID();
                var clone = target.clone().attr("id", uid).val(v).prop("checked", true);
                var label = $("<label>").attr("for",uid).text(v);
                
                var diverge = $("<span>").attr("aj-diverge-value", placeHolderId);
                diverge.append(clone).append(label);
                
                insertPoint.after(diverge);
                insertPoint = diverge;
              });
            }
          }
          break;
        }else{
          //continue to default
        }
      default:
        target.val(newValue);
      } //end switch
      
      //save the current value to target as data attribute
      util.getDataRef(target, "aj-form-binding-ref").value = newValue;
    } // end _render = function...
  } // end !meta._render

  if (formDef._option) {
    var renderFn = meta._render;
    meta._post_binding.push(function (context) {
      var scope = context._scope;
      var ownerSnippet = context._snippet;
      var target = ownerSnippet.find(meta._selector);
      var optionSnippet = formDef._option.bindAsSubSnippet(scope, target, function () {
        var currentDomValue = util.getDataRef(target, "aj-form-binding-ref").value;
        renderFn(target, currentDomValue, undefined, context);
      });
      ownerSnippet._discardHooks.push(function(){
        optionSnippet.discard();
      });
    });
  }
  
  if (!meta._register_dom_change) {
    var changeEvents = new Array();

    var defaultChangeEvent = formDef._default_change_event;
    if (defaultChangeEvent === undefined) {
      changeEvents.push("blur");
    } else if (defaultChangeEvent) {
      changeEvents.push(defaultChangeEvent);
    }

    var extraChangeEvents = formDef._extra_change_events;
    extraChangeEvents = util.regulateArray(extraChangeEvents);
    Array.prototype.push.apply(changeEvents, extraChangeEvents);
    

    if (changeEvents.length > 0) {
      meta._register_dom_change = function (target, changeHandler, bindContext) {
        var snippet = bindContext._snippet;
        var ref = util.getDataRef(target, "aj-form-binding-ref");
        ref.changeEvents = changeEvents;

        var inputType;
        var tagName = target.prop("tagName");
        if(tagName === "INPUT"){
          inputType = target.attr("type");
          if(inputType){
            inputType = inputType.toLowerCase();
          }
        }
        if(inputType === "checkbox" || inputType === "radio"){
          if(formDef._single_check){
            target.bind(changeEvents.join(" "), function () {
              var v = $(this).prop("checked");
              changeHandler(v, bindContext);
            }); 
          }else{
            var observer = new _lib_observe.PathObserver(ref, "value");
            observer.open(function(newValue, oldValue){
              changeHandler(newValue, bindContext);
            });
            snippet._discardHooks.push(function(){
              observer.close();
            });
          }
        }else{
          target.bind(changeEvents.join(" "), function () {
            var v = $(this).val();
            changeHandler(v, bindContext);
          }); 
        }
      }// end meta._register_assign
    };// end changeEvents.length > 0
  }// end !meta._register_assign
}

var api={};

/**
 * _varRef : binding reference
 * _meta   : option meta or target binding property name
 * _meta2  : _duplicator
 */
api.optionBind = function (_varRef, _meta, _meta2) {
  var varRef = _varRef;
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

  var checkKeys = Object.keys(meta);
  if (checkKeys.length !== 1) {
    throw "There can only be one property declaration in option binding, but got:" + checkKeys;
  }

  var optionMeta = meta[checkKeys[0]];
  var itemDef = optionMeta._item; 
  if (!optionMeta._item) {
    optionMeta._item = {};
  }
  var itemDef = optionMeta._item;
  
  //move all the properties to _item
  for (var p in optionMeta) {
    if (p === "_duplicator" || p === "_item") {
      continue;
    }
    itemDef[p] = optionMeta[p];
    delete optionMeta[p];
  }

  //we do not want there are other properties from "_duplicator" and "_item"
  for (var p in optionMeta) {
    if (p === "_duplicator" || p === "_item") {
      continue;
    }
    throw "Only _duplicator and _item are allowed under option binding but found:" + p;
  }

  
  var valueFn = itemDef._value ? itemDef._value : function (v) {
    if(v.value === undefined){
      return v;
    }else{
      return v.value;
    }
  };
  delete itemDef._value;

  var textFn = itemDef._text ? itemDef._text : function (v) {
    if(v.text === undefined){
      return v;
    }else{
      return v.text;
    }
  };
  delete itemDef._text;

  var op = {};
  op.bindAsSubSnippet = function (scope, ownerFormInputTarget, onOptionChange) {
    var snippetRoot;
    
    //rewrite post render
    //it should be rewritten to simple object observe, but right now, we simply hack it.
    if(optionMeta._post_render){
      var pr = optionMeta._post_render;
      optionMeta._post_render = function(){
        onOptionChange();
        pr();
      }
    }else{
      optionMeta._post_render = onOptionChange;
    }
    
    //rewrite render by type
    var tagName = ownerFormInputTarget.prop("tagName");
    switch (tagName) {
    case "SELECT":
      snippetRoot = ownerFormInputTarget;
      if (!optionMeta._duplicator) {
        optionMeta._duplicator = "option:first"; //we will always use the first option as template
      }

      if (!itemDef._selector) {
        itemDef._selector = ":root";
      }
      if (itemDef._render) {
        var renderFn = itemDef._render;
        itemDef._render = function (target, newValue, oldValue) {
          renderFn(target, newValue, oldValue);
        }
      } else {
        itemDef._render = function (target, newValue) {
          target.val(valueFn(newValue));
          target.text(textFn(newValue));
        };
      }
      break;
    case "INPUT":
      var type = ownerFormInputTarget.attr("type");
      if(type){
        type = type.toLowerCase();
      }
      if(type=== "checkbox" || type === "radio"){
        if (!optionMeta._duplicator) {
          throw "_duplicator must be specified for options of checkbox or radio";
        }

        //find out the parent of duplicator
        var parent = ownerFormInputTarget;
        while(!parent.is(optionMeta._duplicator)){
          parent = parent.parent();
        }
        snippetRoot = parent.parent();
        
        if (!itemDef._selector) {
          itemDef._selector = ":root";
        }
        if(itemDef._register_dom_change || itemDef._dom_change){
          throw "_register_dom_change/_dom_change cannot be specified for checkbox/radio option";
        }else{
          var ref = util.getDataRef(ownerFormInputTarget, "aj-form-binding-ref");
          if(ref.changeEvents.length > 0){
            itemDef._register_dom_change = function (target, changeHandler, bindContext){
              var snippet = bindContext._snippet;
              var events = ref.changeEvents.join(" ");
              var targetInput = snippet.find("input");
              targetInput.bind(events, function () {
                var je = $(this);
                var value = je.val();
                var checked = je.prop("checked");
                changeHandler({
                  "value": value,
                  "checked": checked
                }, bindContext);
              });
              /*
              snippet.find("label").bind(events, function(){
                var je= $(this);
                var id = je.attr("for");
                var input = targetInput.filter("#" + id);
                //var eventHandler = input[ref.changeEvents[0]];
                //eventHandler.apply(input);
                var value = input.val();
                //label click may before checkbox "being clicked"
                var checked = !input.prop("checked");
                changeHandler({
                  "value": value,
                  "checked": checked
                }, bindContext);
              });
              */
            }
            itemDef._assign = function (path, changedValue, bindContext) {
              var value = changedValue.value;
              var checked = changedValue.checked;
              if(type === "checkbox"){
                var newResult = util.regulateArray(ref.value);
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
                ref.value = newResult;
              }else{
                ref.value = value;
              }
            } //_assign
          } // ref.changeEvents.length > 0
        } // else of (itemDef._register_assign || itemDef._assign)
        if (!itemDef._render) {
          itemDef._render = function (target, newValue, oldValue, bindContext) {
            var snippet = bindContext._snippet;
            var uid = util.createUID();
            snippet.find("input[type="+type+"]").attr("id", uid).val(valueFn(newValue));;
            snippet.find("label").attr("for", uid).text(textFn(newValue));
          };
        }
        break;
      }else{
        // continue to the default
      }
    default:
      throw "Only select, checkbox or radio can declare _option but found:" + target[0].outerHTML;
    }
    var optionSnippet = new Snippet(scope, snippetRoot);
    optionSnippet.bind(varRef, meta);
    return optionSnippet;
  };
  return op;
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
  if(typeof event1 === "string"){
    defaultChangeEvent = event1;
    extraChangeEvents = event2;
  }else if (Array.isArray(event1)){
    extraChangeEvents = event2;
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

config.meta.rewritterMap["_form"] = {
  priority : constant.metaRewritterPriority["_form"],
  fn : _form
};

module.exports=api;


