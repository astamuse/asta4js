"use strict";

var util = require("./util");
var config = require("./config");

var BindContext=function(valueMonitor, snippet){
  this.valueMonitor = valueMonitor;
  this.snippet = snippet;
  this.discardHook = [];
}

BindContext.prototype.bind=function(meta){
  //var THIS = this;
  if(Array.isArray(meta)){
    for(var i=0;i<meta.length;i++){
      this.bind(meta[i]);
    }
    return;
  }
  
  var nonRecursive = ["_value", "_splice"];
  for(var i in nonRecursive){
    var sub = meta[nonRecursive[i]];
    if(!sub){
      continue;
    }
    for(var j=0;j<sub.length;j++){
      var sm = sub[j];
      if(sm._register_on_change){
        var changeHandler = sm._change_handler_creator.call(sm, this);
        var force = sm._register_on_change.call(sm, this, function(){
          changeHandler.apply(sm, arguments);
        });
        force.apply();
      }
      if(sm._register_assign){
        var assignChangeHandler = sm._assign_change_handler_creator.call(sm, this);
        var force = sm._register_assign.call(sm, this, function(){
          assignChangeHandler.apply(sm, arguments);
          Aj.sync();
        });
        //force.apply
      }
      if(sm._post_binding){
        for(var k=0;k<sm._post_binding.length;k++){
          sm._post_binding[k].call(sm, this);
        }
      }
    });
  }
  
  var propSub = meta._prop;
  if(!propSub){
    return;
  }
  
  for(var i=0;i<propSub.length;i++){
    var ps = probSub[i];
    for(var p in ps){
      var pm = ps[p];
      if(!pm){
        continue;
      }
      this.bind(pm);
    }
  }
}

BindContext.prototype.addDiscardHook=function(fn){
  this.discardHook.push(fn);
}

BindContext.prototype.discard=function(){
  this.valueMonitor.discard();
  this.snippet.discard();
  for(var i=0;i<this.discardHook.length;i++){
    this.discardHook[i].apply();
  }
}
module.exports=BindContext;