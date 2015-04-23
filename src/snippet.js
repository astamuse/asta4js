"use strict";

var util = require("./util");
var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");

var Snippet = function(arg){
  if (typeof arg === "string"){
    this._root = $(arg);//as selector
  }else{
    this._root = arg;
  }
  if(this._root.length == 0){
    var err = new Error("Snippet was not found for given selector:" + this.root.selector);
    console.error(err);
  }
}

Snippet.prototype._discard = function(){
  this._root.remove();
}

Snippet.prototype.find = function(selector){
  return util.findWithRoot(this._root, selector);
}

Snippet.prototype.on = function (event, selector, fn) {
  this._root.on(event, selector, function(){
    fn.apply(this, arguments);
    util.sync();
  });
  return this;
}

module.exports = Snippet;