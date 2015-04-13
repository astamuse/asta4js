var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")

var retrieveWatchMap=function(scope){
  var watchMap = scope.__watch__map__;
  if(!watchMap){
    watchMap = {};
    scope.__watch__map__ = watchMap;
  }
  return watchMap;
};

var _watch = function (meta) {
  var watchDef = meta._watch;
  var watchPropMapPath = meta._target_path + ":" + meta._meta_trace_id;
  
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
      path = f.substr(2);
    }else{
      path = parentPath + "." + f;
    }
    return path;
  });
  
  if (!meta._register_on_change) {
    meta._register_on_change = function(bindContext, changeHandler) {
      var scope = bindContext._scope;
      var arrayedPath = util.replaceIndexesInPath(watchPropMapPath, bindContext._indexes);
      var observePath = "__watch__map__['" + arrayedPath + "']";
      var observer = new _lib_observe.PathObserver(scope, observePath);
      observer.open(function (newValue, oldValue) {
        changeHandler(newValue, oldValue, bindContext);
      });
      var path = _lib_observe.Path.get(observePath);
      return function(){
        changeHandler(path.getValueFrom(scope), undefined, bindContext);
      }
    };
  }
  
  if(!meta._assign){
    meta._assign = function (path, value, bindContext){
      var scope = bindContext._scope;
      var watchMap = retrieveWatchMap(scope);
      
      var arrayedPath = util.replaceIndexesInPath(watchPropMapPath, bindContext._indexes);
      
      watchMap[arrayedPath] = value;
      if(watchDef._store){
        path.setValueFrom(bindContext._scope, value);
      }
    };
  }
  
  if(!meta._register_assign){
    meta._register_assign = function (bindContext, changeHandler){
      var scope = bindContext._scope;
      var watchMap = retrieveWatchMap(scope);
      var targetValuePathes = [];
      var observer = new _lib_observe.CompoundObserver();
      observerTargets.forEach(function(observerPath){
        var arrayedObservePath = util.replaceIndexesInPath(observerPath, bindContext._indexes);
        targetValuePathes.push(_lib_observe.Path.get(arrayedObservePath));
        observer.addPath(scope, arrayedObservePath);
      });
      var arrayedPath = util.replaceIndexesInPath(watchPropMapPath, bindContext._indexes);
      if(bindContext._snippet){
        bindContext._snippet.addDiscardHook(function(){
          observer.close();
          delete watchMap[arrayedPath];
        });
      }
      
      //open observer
      observer.open(function(newValues, oldValues){
        if(watchDef._cal){
          changeHandler(watchDef._cal.apply(null, newValues), bindContext);
        }else{
          changeHandler(newValues, bindContext);
        }
      });
      
      //force retrieve current value
      var getCurrentTargetValue = function(){
        var values = [];
        targetValuePathes.forEach(function(p){
          values.push(p.getValueFrom(scope));
        });
        return values;
      };
      var force = function(){
        var targetValues = getCurrentTargetValue();
        var value;
        if(watchDef._cal){
          value = watchDef._cal.apply(null, targetValues);
        }else{
          value = firstValues;
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


