"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var ValueMonitor = require("./value-monitor")

var _watch = function (meta) {
  var watchDef = meta._watch;
  var parentPath = meta._target_path;
  var dotIdx = parentPath.lastIndexOf(".");
  if(dotIdx >= 0){
    parentPath = parentPath.substring(0, dotIdx);
  }else{
    parentPath = "";
  }
  
  var observerTargets = watchDef._fields.map(function(f){
    var path;
    if(f.indexOf("@:") == 0){
      path = f;
    }else{
      if(parentPath){
        path = parentPath + "." + f;
      }else{
        path = f;
      }
    }
    return path;
  });
  
  meta._virtual = true;
  meta._virtual_root_path = meta._target_path;
  meta._target_path = "";
  
  if(!meta._register_assign){
    meta._register_assign = function (bindContext, changeHandler){
      bindContext._valueMonitor.compoundObserve(meta._meta_trace_id, observerTargets, function(newValues, oldValues){
        if(watchDef._cal){
          changeHandler(watchDef._cal.apply(null, newValues), bindContext);
        }else{
          changeHandler(newValues, bindContext);
        }
      });
      var valueRef = bindContext._valueMonitor.getCompoundValueRef(observerTargets);
      var force = function(){
        var targetValues = valueRef.getValues();
        var value;
        if(watchDef._cal){
          value = watchDef._cal.apply(null, targetValues);
        }else{
          value = targetValues;
        }
        changeHandler(value, bindContext);
      };
      force.apply();
      return force;
    }
  }
};

config.meta.rewritterMap["_watch"] = {
  priority : constant.metaRewritterPriority["_watch"],
  fn : _watch
};


