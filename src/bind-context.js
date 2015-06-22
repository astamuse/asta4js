"use strict";

var util = require("./util");
var config = require("./config");
var normalizeMeta = require("./meta");

var ResourceMap = require("./resource-map");
var ArrayAssistant = require("./bind-context-array-assistant")

var currentBackgroundContext = undefined;
var contextIdMap = {};

var BindContext=function(override, arrayIndexes){
  if(override){
    util.shallowCopy(override, this);
  }
  
  this._id = util.createUID();
  contextIdMap[this._id] = this;
  
  this._backgroundContext = currentBackgroundContext;
  if(this._backgroundContext){
    var self = this;
    this._backgroundContext._addDiscardHook(function(){
      self._discard();
    });
  }

  this._arrayIndexes = arrayIndexes;
  if(arrayIndexes){
      this._arrayIndex = arrayIndexes[arrayIndexes.length-1];
  }
  
  this._resourceMap = new ResourceMap();
  //we declared an independent map for child context due to performance reason
  this._childContextMap = new ResourceMap();
  
  this._discardHook = [];
  
  this._forceSyncFromObserveTargetMap={};
  this._forceSyncToObserveTargetMap={};
  
  /*
  this._iid = util.createUID();
  var backgroundIID;
  if(this._backgroundContext){
    backgroundIID = this._backgroundContext._iid;
  }
  console.log("create context", this._iid, "for indexes:", this._arrayIndexes, "via background", backgroundIID);
  */

}

BindContext.prototype.asBackground = function(fn) {
  var backup = currentBackgroundContext;
  try{
    currentBackgroundContext = this;
    fn.apply();
  }finally{
    currentBackgroundContext = backup;
  }
}

BindContext.prototype._getArrayIndexes=function(){
  return this._arrayIndexes;
}

BindContext.prototype._getArrayIndex=function(){
  return this._arrayIndexes[this._arrayIndexes.length-1];
}

BindContext.prototype._addResource=function(category, identifier, discardable){
  this._resourceMap.add(category, identifier, discardable);
}

BindContext.prototype._removeResource=function(category, identifier){
  this._resourceMap.remove(category, identifier);
}

BindContext.prototype._getResource=function(category, identifier){
  return this._resourceMap.get(category, identifier);
}

BindContext.prototype._createChildContext=function(identifier, index, override){
  var indexes = this._arrayIndexes ? util.clone(this._arrayIndexes) : [];
  indexes.push(index);
  var ov = util.shallowCopy(this);
  util.shallowCopy(override, ov);
  var context = new BindContext(ov, indexes);
  this._childContextMap.add(index, identifier, context);
  context._parentContext = this;
  return context;
}

BindContext.prototype._removeChildContext=function(identifier, index){
  this._childContextMap.remove(index, identifier);
}

BindContext.prototype._getChildContext=function(identifier, index){
  return this._childContextMap.get(index, identifier);
}

var forceSyncWithObserveTarget=function(targetMap, metaTraceId){
  var keys;
  if(metaTraceId){
    var force = targetMap[metaTraceId];
    if(force){
      force.apply();
    }
  }else{
    for(var k in targetMap){
      targetMap[k].apply();
    }
  }
}

BindContext.prototype._forceSyncFromObserveTarget=function(metaTraceId){
  forceSyncWithObserveTarget(this._forceSyncFromObserveTargetMap, metaTraceId);
}

BindContext.prototype._forceSyncToObserveTarget=function(metaTraceId){
  forceSyncWithObserveTarget(this._forceSyncToObserveTargetMap, metaTraceId);
}

BindContext.prototype._bindMetaActions=function(meta){
  if(meta._pre_binding){
    for(var k=0;k<meta._pre_binding.length;k++){
      meta._pre_binding[k].call(meta, this);
    }
  }
  if(meta._register_on_change){
    var changeHandler = meta._change_handler_creator.call(meta, this);
    var force = meta._register_on_change.call(meta, this, function(){
      changeHandler.apply(meta, arguments);
    });
    this._forceSyncFromObserveTargetMap[meta._meta_trace_id] = force;
    force.apply();
  }
  if(meta._register_assign){
    var assignChangeHandler = meta._assign_change_handler_creator.call(meta, this);
    var force = meta._register_assign.call(meta, this, function(){
      assignChangeHandler.apply(meta, arguments);
      util.sync();
    });
    this._forceSyncToObserveTargetMap[meta._meta_trace_id] = force;
  }
  if(meta._post_binding){
    for(var k=0;k<meta._post_binding.length;k++){
      meta._post_binding[k].call(meta, this);
    }
  }
}

BindContext.prototype._bind=function(meta){  
  if(Array.isArray(meta)){
    for(var i=0;i<meta.length;i++){
      this._bind(meta[i]);
    }
    return;
  }
  
  if(!meta._meta_trace_id){
    meta = normalizeMeta(meta);
  }

  var nonRecursive = ["_value", "_splice"];
  for(var i in nonRecursive){
    var sub = meta[nonRecursive[i]];
    if(!sub){
      continue;
    }
    for(var j=0;j<sub.length;j++){
      var sm = sub[j];
      this._bindMetaActions(sm);
    };
  }
  
  var propSub = meta._prop;
  if(!propSub){
    return;
  }
  
  for(var i=0;i<propSub.length;i++){
    var ps = propSub[i];
    for(var p in ps){
      //TODO
      if(p === "_parent_meta" || p === "_orginal_meta"){
        continue;
      }
      var pm = ps[p];
      if(typeof pm === "object"){
        this._bind(pm);
      }
    }
  }

};

BindContext.prototype._addDiscardHook=function(fn){
  this._discardHook.push(fn);
};

BindContext.prototype._discard=function(){
  
  for(var i=0;i<this._discardHook.length;i++){
    this._discardHook[i].apply();
  }
  
  var p;
  for(var k in this){
    if(k === "_parentContext" || k === "_backgroundContext"){
      continue;
    }
    p = this[k];
    if(p && p._discard){
      p._discard();
    }else if(p && p.discard){
      p.discard();
    }
  }
  
  delete contextIdMap[this._id];
  
  //console.log("discard context", this._iid);

};

BindContext.prototype.getArrayAssistant=function(backtrackingToBackground){
  var _backtrackingToBackground = Boolean(backtrackingToBackground);
  var assistant = this._getResource("array-assistant", _backtrackingToBackground);
  if(assistant){
    //OK
  }else{
    assistant = new ArrayAssistant(this, _backtrackingToBackground);
    this._addResource("array-assistant", _backtrackingToBackground, assistant);
  }
  return assistant;
}

BindContext.prototype.toString=function(){
  return this._id;
}

BindContext.retrieveById=function(id){
  return contextIdMap[id];
}

module.exports=BindContext;