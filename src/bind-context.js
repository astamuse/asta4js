"use strict";

var util = require("./util");
var config = require("./config");
var normalizeMeta = require("./meta");

var ResourceMap = require("./resource-map");

var BindContext=function(override, arrayIndexes){
  if(override){
    util.shallowCopy(override, this);
  }

  this.arrayIndexes = arrayIndexes;
  this.resourceMap = new ResourceMap();
  //we declared an independent map for child context due to performance reason
  this.childContextMap = new ResourceMap();
  
  this.discardHook = [];
  
  this.forceSyncFromObserveTargetMap={};
  this.forceSyncToObserveTargetMap={};  

}

BindContext.prototype.addResource=function(category, identifier, discardable){
  this.resourceMap.add(category, identifier, discardable);
}

BindContext.prototype.removeResource=function(category, identifier){
  this.resourceMap.remove(category, identifier);
}

BindContext.prototype.getResource=function(category, identifier){
  return this.resourceMap.get(category, identifier);
}

BindContext.prototype.createChildContext=function(identifier, index, override){
  var indexes = this.arrayIndexes ? util.clone(this.arrayIndexes) : [];
  indexes.push(index);
  var ov = util.shallowCopy(this);
  util.shallowCopy(override, ov);
  var context = new BindContext(ov, indexes);
  this.childContextMap.add(index, identifier, context);
  context.parentContext = this;
  return context;
}

BindContext.prototype.removeChildContext=function(identifier, index){
  this.childContextMap.remove(index, identifier);
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

BindContext.prototype.forceSyncFromObserveTarget=function(metaTraceId){
  forceSyncWithObserveTarget(this.forceSyncFromObserveTargetMap, metaTraceId);
}

BindContext.prototype.forceSyncToObserveTarget=function(metaTraceId){
  forceSyncWithObserveTarget(this.forceSyncToObserveTargetMap, metaTraceId);
}

BindContext.prototype.bindMetaActions=function(meta){
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
    this.forceSyncFromObserveTargetMap[meta._meta_trace_id] = force;
    console.log(this._trace_id, "added force from target of:", meta._meta_trace_id);
    force.apply();
  }
  if(meta._register_assign){
    var assignChangeHandler = meta._assign_change_handler_creator.call(meta, this);
    var force = meta._register_assign.call(meta, this, function(){
      assignChangeHandler.apply(meta, arguments);
      util.sync();
    });
    this.forceSyncToObserveTargetMap[meta._meta_trace_id] = force;
  }
  if(meta._post_binding){
    for(var k=0;k<meta._post_binding.length;k++){
      meta._post_binding[k].call(meta, this);
    }
  }
}

BindContext.prototype.bind=function(meta){  
  if(Array.isArray(meta)){
    for(var i=0;i<meta.length;i++){
      this.bind(meta[i]);
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
      this.bindMetaActions(sm);
    };
  }
  
  var propSub = meta._prop;
  if(!propSub){
    return;
  }
  
  for(var i=0;i<propSub.length;i++){
    var ps = propSub[i];
    for(var p in ps){
      var pm = ps[p];
      if(typeof pm === "object"){
        this.bind(pm);
      }
    }
  }

};

BindContext.prototype.addDiscardHook=function(fn){
  this.discardHook.push(fn);
};

BindContext.prototype.discard=function(){
  var p;
  for(var k in this){
    p = this[k];
    if(p && p.discard){
      p.discard();
    }
  }
  for(var i=0;i<this.discardHook.length;i++){
    this.discardHook[i].apply();
  }
};

module.exports=BindContext;