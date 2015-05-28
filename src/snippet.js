"use strict";

var util = require("./util");
var config = require("./config");
var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");

var $ = config.$;

var Snippet = function(arg){
  this._root = config.snippet.resolveRoot(arg);
  if(this._root.length == 0){
    var err = new Error("Snippet was not found for given parameter:" + JSON.stringify(arg));
    console.error(err);
  }
}

Snippet.prototype._discard = function(){
  this._root.remove();
}

Snippet.prototype.find = function(selector){
  return util.findWithRoot(this._root, selector);
}

Snippet.prototype.bind = function(){
  if(typeof arguments[0] === "string"){
    return this.bindEvent.apply(this, arguments);
  }{
    return this.bindMeta.apply(this, arguments);
  }
}

Snippet.prototype.bindMeta = function(meta, context){
  var ctx = context ? util.shallowCopy(context) : {};
  ctx._snippet = this;
  var bindContext = new BindContext(ctx);
  bindContext._bind(meta);
  return this;
}

var _convertArgumentsWithSyncOnFunctions = function(){
  var newArgs = new Array();
  for(var i=0;i<arguments.length;i++){
    newArgs[i] = (function(arg){
      if(typeof arg === "function"){
        return function(){
          var ret = arg.apply(this, arguments);
          util.sync();
          return ret;
        }
      }else{
        return arg;
      }
    })(arguments[i]);
  }
  return newArgs;
}

Snippet.prototype.bindEvent = function(){
  var newArgs = _convertArgumentsWithSyncOnFunctions.apply(null, arguments);
  
  var selector = newArgs[0];
  newArgs.shift();
  
  var target = this.find(selector);
  if(target.length == 0){
    console.error("could not find target to bind event for:", selector);
    return this;
  }else{
    target.bind.apply(target, newArgs);
    return this;
  }
}

Snippet.prototype.on = function () {
  var newArgs = _convertArgumentsWithSyncOnFunctions.apply(null, arguments);
  this._root.on.apply(this._root, newArgs);
  return this;
}

config.snippet.resolveRoot = function(arg){
  var root;
  if (typeof arg === "string"){
    root = $(arg);//as selector
  }else if(util.isJQuery(arg)){
    root = arg;
  }else{
    throw "JQuery object is expected for snippet root but found:" + JSON.stringify(arg);
  }
  return root;
}

module.exports = Snippet;