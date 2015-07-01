"use strict";

var util = require('./util');

var moduleCache = {
  wrapped: {},
  raw: {}
};

var wrapSyncToModule = function(mod){
  var wmod = {};
  var k,v;
  for(k in mod){
    v = mod[k];
    if(typeof v === "function"){
      (function(k, v){
        wmod[k] = function(){
          var ret = v.apply(this, arguments);
          util.sync();
          return ret;
        }
      })(k, v);
    }else{
      wmod[k] = v;
    }
  }
  return wmod;
}

var acceptModule = function(mod, modName, wrap, cacheTarget, argIndex, expectArgSize, argContainer, initFunc){
  if(mod){
    var useMod = mod;
    if(cacheTarget){
      if(wrap){
        useMod = wrapSyncToModule(mod);
      }
      moduleCache[cacheTarget][modName] = useMod;
    }
    argContainer.push({
      index: argIndex,
      mod: useMod
    });
  }else if(modName){
    throw "failed to load module:" + modName;
  }

  if(expectArgSize === argContainer.length){
    argContainer.sort(function(arg1, arg2){
      return arg1.index - arg2.index;
    });
    var invokeArgs = argContainer.map(function(arg){
      return arg.mod;
    });
    var scope = Aj.config.scope.create();
    invokeArgs.push(scope);
    initFunc.apply(null, invokeArgs);
  }
}

module.exports = function(arg1, arg2){
  var _require = require('./config').moduleRequire;
  var deps, initFunc;
  if(arg2 === undefined && typeof arg1 === "function"){
    initFunc = arg1;
  }else if(Array.isArray(arg1) && typeof arg2 === "function"){
    deps = arg1;
    initFunc = arg2;
  }else{
    throw "illegal argument: only ([array], function) or (function) is acceptable.";
  }
  
  if(deps){
    var invokeInitArgs = [];
    var m, modName, wrap, cache;
    for(var i=0;i<deps.length;i++){
      m = deps[i];
      if(typeof m === "string"){
        modName = m;
        wrap = true;
        cache = true;
      }else{
        modName = m.name;
        wrap = m.wrap;
        cache = m.cache;
      }
      (function(modName, wrap, cache, i){
        if(cache){
          var cacheTarget = wrap ? "wrapped": "raw";
          var mod = moduleCache[cacheTarget][modName];
          if(mod){
            acceptModule(mod, modName, undefined, undefined, i, deps.length, invokeInitArgs, initFunc);
          }else{
            _require(modName, function(mod){
              acceptModule(mod, modName, wrap, cacheTarget, i, deps.length, invokeInitArgs, initFunc);
            })
          }
        }else{
          _require(modName, function(mod){
            acceptModule(mod, modName, wrap, undefined, i, deps.length, invokeInitArgs, initFunc);
          });
        }
      })(modName, wrap, cache, i);
    }
  }else{
    acceptModule(undefined, undefined, undefined, undefined, undefined, undefined, [], initFunc);
  }
  
};