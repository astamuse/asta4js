"use strict";

var _lib_observe = require("../lib/observe");

var util=require("./util");
var arrayUtil=require("./arrayUtil");

var config=require("./config");
var constant = require("./constant")

var __reverseMetaKeys = ["_meta_type", "_parent_meta", "_orginal_meta", "_meta_id", "_meta_trace_id", "_meta_desc", 
                         "_value", "_value_ref", "_prop", "_splice", 
                         "_target_path", "_virtual", "_virtual_root_path"];

var __ordered_metaRewritter = null;

var getOrderedMetaRewritter = function(){
  if(__ordered_metaRewritter){
    return __ordered_metaRewritter;
  }
  
  var array = new Array();
  for (var k in config.meta.rewritterMap) {
    var def = config.meta.rewritterMap[k];
    var _priority = null;
    var _fn = null;
    var _key = null;
    var defType = typeof def;
    if (defType === "object") {
      _priority = def.priority;
      _fn = def.fn;
      _key = def.key;
    } else if(defType === "function"){
      _fn = def;
    } else{
      throw "Object or function expected but got:" + defType
            + "\n"
            + JSON.stringify(def);
    }
    
    if(!_priority){
      _priority = 100;
    }
    if(!_fn){
      throw "fn of meta rewritter cannot be empty";
    }
    if(!_key){
      _key = k;
    }
    
    array.push({
      key : _key,
      fn : _fn,
      priority : _priority
    });
  } //end k loop
  //order the array
  array.sort(function (a, b) {
    if (a.priority === b.priority) {
      return a.key.localeCompare(b.key);
    } else {
      return a.priority - b.priority;
    }
  });
  __ordered_metaRewritter = array;
  return __ordered_metaRewritter;
};

//rewrite all the definition
var createAndRetrieveSubMetaRef = function(meta, subType){
  var ref;
  var sub = meta[subType];
  if(Array.isArray(sub)){
    ref = {};
    sub.push(ref);
  }else if (sub){
    var t = typeof sub;
    if(t === "object"){
       meta[subType] = [];
       meta[subType].push(sub);
      ref = sub;
    }else {
      meta[subType] = [];
      meta[subType].push(sub);
      ref = {};
      meta[subType].push(ref);
    }
  }else{
    ref = {};
    meta[subType] = [];
    meta[subType].push(ref);
  }
  return ref;
};

var initBindingHookArray = function(meta, hookName){
  if(meta[hookName]){
    if(Array.isArray(meta[hookName])){
      meta[hookName] = [].concat(meta[hookName]);
    }else{
      throw hookName + " must be array but we got:" + JSON.stringify(meta);
    }
  }else{
    meta[hookName] = [];
  }
}

var defaultTransformFn = function(v){
  return v;
}

var defaultTransform = {
  _set_value: defaultTransformFn,
  _get_value: defaultTransformFn,
}

var creatorDebugIntercept=function(debugId, meta, creator, creatorType){
  return function(bindContext){
    var fn = creator.call(this, bindContext);
    return function(){
      console.log("debug info:", debugId, "\ncurrent meta:", meta, "\n("+creatorType+")calling args:", arguments);
      if(meta._item && bindContext._snippet && !meta._duplicator){
        console.error("it seems that _duplicator is absent for current meta which is with _item define. current meta:", meta);
      }
      fn.apply(this, arguments);
    };
  }
}

var getValueMonitor=function(bindContext, virtualRootPath){
  if(virtualRootPath === undefined){
    return bindContext._valueMonitor;
  }else{
    return bindContext._valueMonitor.getVirtualMonitor(virtualRootPath);
  }
}

var normalizeMeta = function(meta, propertyPath, parentMeta){
  
  if(propertyPath === undefined || propertyPath === null){
    propertyPath = "";
  }
  
  if(Array.isArray(meta)){
    return meta.map(function(m){
      return normalizeMeta(m, propertyPath, parentMeta);
    });
  }
  
  
  var newMeta = util.clone(meta);
  
   //convert function to standard meta format
  if(typeof newMeta !== "object"){
    newMeta = config.meta.nonObjectMetaConvertor(newMeta);
  }
  
  if(newMeta._merge){
    var mergeSource = newMeta._merge;
    delete newMeta._merge;
    newMeta = mergeMeta(mergeSource, newMeta)
    if(config.debug && newMeta._debug){
      console.log("merged meta(" + newMeta._debug + ")", newMeta);
    }
  }

  if(newMeta._meta_type){
    //do nothing
  }else{
    newMeta._meta_type = "_root";
  }
  
  newMeta._meta_trace_id = util.createUID();
  newMeta._parent_meta = parentMeta;
  if(newMeta._meta_id){
    newMeta._orginal_meta = util.clone(meta);
  }
  
  if(newMeta._virtual){
    newMeta._virtual_root_path = propertyPath;
    propertyPath = "";
  }else{
    newMeta._virtual_root_path = undefined;
  }
  
  if(parentMeta){
    if(parentMeta._virtual_root_path !== undefined){
      if(newMeta._virtual_root_path === undefined){
        newMeta._virtual_root_path = parentMeta._virtual_root_path;
      }else{//virtual under virtual, kick ass!
        newMeta._virtual_root_path = parentMeta._virtual_root_path + "['" + newMeta._virtual_root_path + "']";
      }
    }
  }

  switch(newMeta._meta_type){
    case "_root":
      var subMetas = ["_value", "_value_ref" , "_prop", "_splice"];
      var subRefs = {
        _value  : createAndRetrieveSubMetaRef(newMeta, "_value"),
        _value_ref  : createAndRetrieveSubMetaRef(newMeta, "_value_ref"),
        _prop   : createAndRetrieveSubMetaRef(newMeta, "_prop"),
        _splice : createAndRetrieveSubMetaRef(newMeta, "_splice"),
      };
      for(var k in newMeta){
        if(__reverseMetaKeys.indexOf(k) >= 0){
          continue;
        }
        var moveTarget = config.meta.fieldClassifier(k);
        
        if(!Array.isArray(moveTarget)){
          moveTarget = [moveTarget];
        }
        for(var i=0;i<moveTarget.length;i++){
          var targetRef = subRefs[moveTarget[i]];
          if(targetRef){
            if(i > 0){
              targetRef[k] = util.clone(newMeta[k]);
            }else{
              targetRef[k] = newMeta[k];
            }
          }else{
            throw "fieldClassifier can only return '_value' or '_prop' or '_splice' rather than '" + moveTarget[i] + "'";
          }
        }
        newMeta[k] = null;
        delete newMeta[k];
      }
      for(var subIdx in subMetas){
        var subMetak = subMetas[subIdx];
        var subMeta = newMeta[subMetak];
        //make sure meta type is right
        for(var i in subMeta){//must be array due to the createAndRetrieveSubMetaRef
          var sm = subMeta[i];
          var t = typeof sm;
          if(t === "object"){
            sm._meta_type = subMetak;
          }else {
            subMeta[i] = config.meta.nonObjectMetaConvertor(subMeta[i]);
            subMeta[i]._meta_type = subMetak;
          }
          subMeta[i]._target_path = propertyPath;
        }
        newMeta[subMetak] = normalizeMeta(subMeta, propertyPath, newMeta);
      }
    break;
    case "_splice":
    case "_value":
    case "_value_ref":
      //now we will call the registered meta rewritter to rewrite the meta
      
      if(newMeta._meta_type === "_value"){
        //array binding
        var itemMeta = newMeta._item;
        if(itemMeta){
          newMeta._item = normalizeMeta(itemMeta, "", newMeta);
        }
        //transform
        if(newMeta._transform){
          var regulateTransform;
          var type = typeof newMeta._transform;
          if(type === "object"){
            regulateTransform = util.shallowCopy(newMeta._transform, {});
            if(!regulateTransform._set_value){
              regulateTransform._set_value = defaultTransformFn;
            }
            if(!regulateTransform._get_value){
              regulateTransform._get_value = defaultTransformFn;
            }
          }else if(type === "function"){//treat function as _get_value for most common case
            regulateTransform = {
              _set_value: defaultTransformFn,
              _get_value: newMeta._transform,
            };
          }else{
            throw "unsupported _transform define:" + JSON.stringify(newMeta._transform);
          }
          newMeta._transform = regulateTransform;
        }else{
          newMeta._transform = defaultTransform;
        }
        
      }
      
      //binding hooks
      initBindingHookArray(newMeta, "_pre_binding");
      initBindingHookArray(newMeta, "_post_binding");

      //rewrite meta
      getOrderedMetaRewritter().forEach(function (mr) {
        var m = newMeta[mr.key];
        if (m !== undefined && m !== null) {
          mr.fn(newMeta);
          if(!config.debug){
            //remove unnecessary meta info to reduce memory usage
            newMeta[mr.key] = null;
            delete newMeta[mr.key];
          }
        }
      });
      
      if(newMeta._change_handler_creator || newMeta._item){
        if(!newMeta._register_on_change){
          var targetPath = newMeta._target_path;
          newMeta._register_on_change = function (bindContext, changeHandler) {
            var vm = getValueMonitor(bindContext, newMeta._virtual_root_path);
            var vr = vm.getValueRef(targetPath, newMeta._transform);
            if(newMeta._meta_type === "_value_ref"){
              vm.pathObserve(newMeta._meta_trace_id, targetPath, function(newValue, oldValue){
                changeHandler(vr, undefined, bindContext);
              }, newMeta._transform);
              return function(){
                changeHandler(vr, undefined, bindContext);
              };
            }else{
              vm.pathObserve(newMeta._meta_trace_id, targetPath, function(newValue, oldValue){
                changeHandler(newValue, oldValue, bindContext);
              }, newMeta._transform);
              return function(){
                changeHandler(vr.getValue(), undefined, bindContext);
              };
            }
          };
          if(newMeta._item){
            var changeHandlerCreator = newMeta._change_handler_creator;
            var itemMeta = newMeta._item;
            var arrayMap = newMeta._array_map;
            var arrayDiscard = newMeta._array_discard;
            /*
            if(!arrayMap){
              throw "_array_map and _array_discard is necessary for _item mapping but we got:" + JSON.stringify(newMeta);
            }
            */
            var arrayChildContextCreator = newMeta._array_child_context_creator;
            if(!arrayChildContextCreator){
              arrayChildContextCreator = function(parentContext, contextOverride, index){
                var childContext = parentContext._createChildContext(this._item._meta_trace_id, index, contextOverride);
                return childContext;
              };
              newMeta._array_child_context_creator = arrayChildContextCreator;
            }
            newMeta._change_handler_creator = function(bindContext){
              var existingChangeFn = changeHandlerCreator ? changeHandlerCreator.call(this, bindContext) : undefined;
              //we have to discard the mapped array before current context is discarded.
              if(arrayDiscard){
                bindContext._addDiscardHook(function(){
                  arrayDiscard.call(newMeta, bindContext);
                });
              }
              return function(newValue, oldValue, bindContext){
                if(existingChangeFn){
                  existingChangeFn.apply(this, arguments);
                }
                
                var vm = getValueMonitor(bindContext, newMeta._virtual_root_path);
                
                //register spice at first
                if(newValue){
                  
                  vm.arrayObserve(newMeta._meta_trace_id, newValue, function(splices){
                    
                     //retrieve mapped array for item monitor
                    var mappedArray = arrayMap ? arrayMap.call(newMeta, newValue, newValue, bindContext) : newValue;
                    if(!mappedArray && newValue){
                      throw "Did you forget to return the mapped array from _array_map of: " + JSON.stringify(newMeta);
                    }
                    var addedCount = 0;
                    var removedCount = 0;

                    splices.forEach(function (s) {
                      removedCount += s.removed.length;
                      addedCount += s.addedCount;
                    });

                    var diff = addedCount - removedCount;
                    var newLength = newValue.length;
                    if(diff > 0){
                      var childContext;
                      var newRootMonitorPath;
                      var newIndex;
                      for (var i = diff; i >0; i--) {
                        newIndex = newLength - i;
                        newRootMonitorPath = targetPath + "[" + newIndex +"]";
                        newMonitor = vm.createSubMonitor(newRootMonitorPath);
                        var childContext = {
                          _valueMonitor: newMonitor,
                          _boundArray: newValue,
                          _mappedArray: mappedArray
                        };
                        childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, newIndex);
                        childContext._bind(itemMeta);
                      }
                    }else{
                      diff = 0 - diff;
                      for(var i=0;i<diff;i++){
                        bindContext._removeChildContext(itemMeta._meta_trace_id, newLength + i);
                      }
                    }
                  });
                }else if(oldValue){//which means we need to remove previous registered array observer
                  vm.removeArrayObserve(newMeta._meta_trace_id);
                }
                
                //retrieve mapped array for item monitor
                var mappedArray = arrayMap ? arrayMap.call(newMeta, newValue, oldValue, bindContext): newValue;
                if(!mappedArray && newValue){
                  throw "Did you forget to return the mapped array from _array_map of: " + JSON.stringify(newMeta);
                }
                
                //bind item context
                var regularOld = arrayUtil.regulateArray(oldValue);
                var regularNew = arrayUtil.regulateArray(newValue);
                var childContext;
                var newRootMonitorPath;
                var newMonitor;
                //update existing child context bound/mapped array
                for(var i=0;i<regularOld.length;i++){
                  childContext = bindContext._getChildContext(itemMeta._meta_trace_id, i);
                  childContext._boundArray = newValue;
                  childContext._mappedArray = mappedArray;
                }
                //add new child context binding
                for(var i=regularOld.length;i<regularNew.length;i++){
                  newRootMonitorPath = targetPath + "[" + i +"]";
                  newMonitor = vm.createSubMonitor(newRootMonitorPath);
                  var childContext = {
                    _valueMonitor: newMonitor,
                    _boundArray: newValue,
                    _mappedArray: mappedArray //must be not null
                  };
                  childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, i);
                  childContext._bind(itemMeta);
                }
                for(var i=regularNew.length;i<regularOld.length;i++){
                  bindContext._removeChildContext(itemMeta._meta_trace_id, i);
                }
              };//returned change handler
            };
          }//_item
          
          if(newMeta._meta_type == "_splice"){
            var spliceChangeHandlerCreator = newMeta._change_handler_creator;
            newMeta._change_handler_creator = function(bindContext){
              var spliceFn = spliceChangeHandlerCreator.call(this, bindContext);
              return function(newValue, oldValue, bindContext){
                var vm = getValueMonitor(bindContext, newMeta._virtual_root_path);
                if(newValue){
                  vm.arrayObserve(newMeta._meta_trace_id, newValue, spliceFn);
                }else if(oldValue){//which means we need to remove previous registered array observer
                  vm.removeArrayObserve(newMeta._meta_trace_id);
                }
              }
            }
          }//_splice
        }
      }
      //set default assign even we do not need it
      if(!newMeta._assign_change_handler_creator){
        var targetPath = newMeta._target_path;
        newMeta._assign_change_handler_creator = function(bindContext){
          var vm = getValueMonitor(bindContext, newMeta._virtual_root_path);
          if(newMeta._meta_type === "_value_ref"){
            return function(value, bindContext){
              throw "Cannot assign value to value reference.";
            };
          }else{
            var vr = vm.getValueRef(targetPath, newMeta._transform)
            return function(value, bindContext){
              vr.setValue(value);
            };
          }
        }
      }
      
      //debugger
      if(config.debug && newMeta._debug){
        if(newMeta._change_handler_creator){
          newMeta._change_handler_creator = creatorDebugIntercept(newMeta._debug, newMeta, newMeta._change_handler_creator, "on change");
        }
        if(newMeta._assign_change_handler_creator){
          newMeta._assign_change_handler_creator = creatorDebugIntercept(newMeta._debug, newMeta, newMeta._assign_change_handler_creator, "on assign");
        }
      }
      
    break;
    case "_prop":
      for(var p in newMeta){
        if(__reverseMetaKeys.indexOf(p) >= 0){
          continue;
        }
        var ppm = newMeta[p];
        if(ppm.nonMeta){
          continue;
        }
        if(p === "_index" || p === "_indexes" || p === "_context"){
          newMeta[p] = normalizeMeta(ppm, p, newMeta);
        }else{
          var recursivePath;
          if(propertyPath){
            recursivePath = propertyPath + "." + p; 
          }else{
            recursivePath = p;
          }
          newMeta[p] = normalizeMeta(ppm, recursivePath, newMeta);
        }
      }
    break;
    default :
      throw "impossible meta type:" + newMeta._meta_type;
  }
  return newMeta;
};

var mergeMeta=function(from, to){
  var ret = to;
  if(from === undefined || from === null){
    //do nothing
  }else if (to === undefined || to === null){
    ret = util.clone(from);
  }else if(Array.isArray(from) && Array.isArray(to)){
    Array.prototype.push.apply(to, from);
  }else if (util.isPlainObject(from) && util.isPlainObject(to)){
    var fc;
    var fp, tp;
    for(var p in from){
      fc = config.meta.fieldClassifier(p);
      fp = from[p];
      tp = to[p];
      to[p] = mergeMeta(fp, tp);
      /*
      if( fc === "_value"){
        to[p] = mergeMeta(fp, tp);
      }else{//_prop or _splice
        if(Array.isArray(fp) || Array.isArray(tp)){
          to[p] = mergeMeta(fp, tp);
        }else{
          var tmp = [];
          if(tp){
            tmp.push(tp);
          }
          if(fp){
            tmp.push(fp);
          }
          to[p] = tmp;
        }
      }
      */
    }
  }else if(util.isPlainObject(from) && Array.isArray(to)){
    to.push(from);
  }else if(Array.isArray(from) && util.isPlainObject(to)){
    ret = [];
    ret.push(to);
    Array.prototype.push.apply(ret, from);
  }else{
    /*
    throw "cannot merge meta from \n"
          + JSON.stringify(from) + "\n"
          + " to \n"
          + JSON.stringify(to) + "\n"
          + "(possibly have conflict property define, change one of them to array to avoid conflict)";
    */
    ret = [];
    ret.push(to);
    ret.push(from);
  }
  return ret;
}

var _on_change = function(meta){
  var changeFn = meta._on_change;
  //if _on_change is specified, the _change_handler_creator will be forced to handle _on_change
  meta._change_handler_creator = function(bindContext){
    return changeFn;
  }
};

var _assign = function(meta){
  var changeFn = meta._assign;
  var propertyPath = meta._target_path;
  //if _assign is specified, the _assign_change_handler_creator will be forced to handle _assign
  meta._assign_change_handler_creator = function(bindContext){
    return function(value, bindContext){
      changeFn(value, bindContext);
    };
  }
};

//default config
config.meta.nonObjectMetaConvertor = function(meta){
  var type = typeof meta;
  if(type === "string"){
    return {
      _selector: meta
    }
  }else if (type === "function"){
    return {
      _on_change : meta
    }
  }else{
    throw "Not supported meta data type:" + type
          + "\n"
          + JSON.stringify(meta);
  }
};

config.meta.fieldClassifier = function (fieldName, metaId) {
  if (fieldName === "_context"){
    return "_prop";
  } else if (fieldName === "_index"){
    return "_prop";
  } else if (fieldName === "_indexes") {
    return "_prop";
  } else if (fieldName === "_splice"){
    return "_splice";
  } else if (fieldName.indexOf("_") === 0) {
    return "_value";
  } else {
    return "_prop";
  }
};

config.meta.rewritterMap["_on_change"] = {
  priority : constant.metaRewritterPriority["_on_change"],
  fn : _on_change
};

config.meta.rewritterMap["_assign"] = {
  priority : constant.metaRewritterPriority["_assign"],
  fn : _assign
};

module.exports = {
  normalizeMeta: normalizeMeta,
  mergeMeta: mergeMeta
}