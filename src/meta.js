"use strict";

var _lib_observe = require("../lib/observe");

var util=require("./util");
var config=require("./config");
var constant = require("./constant")

var __reverseMetaKeys = ["_meta_type", "_meta_id", "_meta_trace_id", "_meta_desc", "_value", "_prop", "_splice", "_target_path"];

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

var normalizeMeta = function(meta, metaId, propertyPath){
  
  if(propertyPath === undefined || propertyPath === null){
    propertyPath = "";
  }
  
  if(Array.isArray(meta)){
    return meta.map(function(m){
      return normalizeMeta(m, metaId, propertyPath);
    });
  }
  
  
  var newMeta = util.clone(meta);
  
   //convert function to standard meta format
  if(typeof newMeta !== "object"){
    newMeta = config.meta.nonObjectMetaConvertor(newMeta);
  }

  if(newMeta._meta_type){
    //do nothing
  }else{
    newMeta._meta_type = "_root";
  }
  if(!newMeta._meta_id){
    if(metaId){
      newMeta._meta_id = metaId;
    }else{
      newMeta._meta_id = util.createUID();
    }
  }
  
  newMeta._meta_trace_id = util.createUID();

  switch(newMeta._meta_type){
    case "_root":
      var subMetas = ["_value", "_prop", "_splice"];
      var subRefs = {
        _value  : createAndRetrieveSubMetaRef(newMeta, "_value"),
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
        newMeta[subMetak] = normalizeMeta(subMeta, newMeta._meta_id, propertyPath);
      }
    break;
    case "_splice":
    case "_value":
      //now we will call the registered meta rewritter to rewrite the meta
      
      if(newMeta._meta_type === "_value"){
        //array binding
        var itemMeta = newMeta._item;
        if(itemMeta){
          newMeta._item = normalizeMeta(itemMeta, newMeta._meta_id, "");
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
          newMeta[mr.key] = null;
          delete newMeta[mr.key];
        }
      });
      
      if(newMeta._change_handler_creator || newMeta._item){
        if(!newMeta._register_on_change){
          var targetPath = newMeta._target_path;
          newMeta._register_on_change = function (bindContext, changeHandler) {
            bindContext.valueMonitor.pathObserve(newMeta._meta_trace_id, targetPath, function(newValue, oldValue){
              changeHandler(newValue, oldValue, bindContext);
            });
            var vr = bindContext.valueMonitor.getValueRef(targetPath);
            return function(){
              changeHandler(vr.getValue(), undefined, bindContext);
            };
          };
          if(newMeta._item){
            var changeHandlerCreator = newMeta._change_handler_creator;
            var itemMeta = newMeta._item;
            var arrayMap = newMeta._array_map;
            var arrayDiscard = newMeta._array_discard;
            
            if(!arrayMap || !arrayDiscard){
              throw "_array_map and _array_discard is necessary for _item mapping but we got:" + JSON.stringify(newMeta);
            }
            var arrayChildContextCreator = newMeta._array_child_context_creator;
            if(!arrayChildContextCreator){
              arrayChildContextCreator = function(parentContext, contextOverride, index){
                var childContext = parentContext.createChildContext(this._item._meta_trace_id, index, contextOverride);
                return childContext;
              };
              //may not be necessary, but...
              newMeta._array_child_context_creator = arrayChildContextCreator;
            }
            newMeta._change_handler_creator = function(bindContext){
              var existingChangeFn = changeHandlerCreator ? changeHandlerCreator.call(this, bindContext) : undefined;
              //we have to discard the mapped array before current context is discarded.
              bindContext.addDiscardHook(function(){
                arrayDiscard.apply(newMeta);
              });
              return function(newValue, oldValue, bindContext){
                var scope = bindContext._scope;
                if(existingChangeFn){
                  existingChangeFn.call(this, arguments);
                }
                
                //register spice at first
                if(newValue){
                  bindContext.valueMonitor.arrayObserve(newMeta._meta_trace_id, newValue, function(splices){
                    
                     //retrieve mapped array for item monitor
                    var mappedArray = arrayMap.call(newMeta, newValue, newValue, bindContext);
                    
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
                      for (var i = diff; i >0; i--) {
                        newRootMonitorPath = targetPath + "[" + (newLength - i) +"]";
                        newMonitor = bindContext.valueMonitor.createSubMonitor(newRootMonitorPath);
                        var childContext = {
                          valueMonitor: newMonitor,
                          mappedItem: mappedArray[i] //must be not null
                        };
                        childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, newLength - i);
                        childContext.bind(itemMeta);
                      }
                    }else{
                      diff = 0 - diff;
                      for(var i=0;i<diff;i++){
                        bindContext.removeChildContext(itemMeta._meta_trace_id, newLength + i);
                      }
                    }
                  });
                }else if(oldValue){//which means we need to remove previous registered array observer
                  bindContext.valueMonitor.removeArrayObserve(newMeta._meta_trace_id);
                }
                
                //retrieve mapped array for item monitor
                var mappedArray = arrayMap.call(newMeta, newValue, oldValue, bindContext);
                
                //bind item context
                var regularOld = util.regulateArray(oldValue);
                var regularNew = util.regulateArray(newValue);
                var childContext;
                var newRootMonitorPath;
                var newMonitor;
                //add new child context binding
                for(var i=regularOld.length;i<regularNew.length;i++){
                  newRootMonitorPath = targetPath + "[" + i +"]";
                  newMonitor = bindContext.valueMonitor.createSubMonitor(newRootMonitorPath);
                  var childContext = {
                    valueMonitor: newMonitor,
                    mappedItem: mappedArray[i] //must be not null
                  };
                  childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, i);
                  childContext.bind(itemMeta);
                }
                for(var i=regularNew.length;i<regularOld.length;i++){
                  bindContext.removeChildContext(itemMeta._meta_trace_id, i);
                }
              };//returned change handler
            };
          }//_item
          /*
          if(newMeta._meta_type == "_splice"){
            var spliceChangeHandlerCreator = newMeta._change_handler_creator;
            newMeta._change_handler_creator = function(bindContext){
              var spliceFn = spliceChangeHandlerCreator.call(this, bindContext);
              return function(newValue, oldValue, bindContext){
                bindContext.valueMonitor.arrayObserve(newMeta._meta_trace_id, newMeta._target_path, spliceFn);
              }
            }
          }//_splice
          */
        }
      }
      //set default assign even we do not need it
      if(!newMeta._assign_change_handler_creator){
        var targetPath = newMeta._target_path;
        newMeta._assign_change_handler_creator = function(bindContext){
          var vr = bindContext.valueMonitor.getValueRef(targetPath)
          return function(value, bindContext){
            vr.setValue(value);
          };
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
        if(p === "_index" || p === "_indexes"){
          newMeta[p] = normalizeMeta(ppm, newMeta._meta_id, p);
        }else{
          var recursivePath;
          if(propertyPath){
            recursivePath = propertyPath + "." + p;
          }else{
            recursivePath = p;
          }
          newMeta[p] = normalizeMeta(ppm, newMeta._meta_id, recursivePath);
        }
      }
    break;
    default :
      throw "impossible meta type:" + newMeta._meta_type;
  }
  return newMeta;
};

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
  if (fieldName === "_index"){
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

module.exports = normalizeMeta