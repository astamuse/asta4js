"use strict";

var util = require("./util");
var config = require("./config");
var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");

var $ = config.$;

var Snippet = function(arg){
  if (typeof arg === "string"){
    this._root = $(arg);//as selector
  }else if(util.isJQuery(arg)){
    this._root = arg;
  }else{
    throw "JQuery object is expected for snippet root but found:" + JSON.stringify(arg);
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


config.snippet.findRoot = function(selector){
  return $(selector);
}

module.exports = Snippet;