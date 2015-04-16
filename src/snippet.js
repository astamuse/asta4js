"use strict";

var util = require("./util");
var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");

var Snippet = function(selector){
  this.root = $(selector);
  if(this.root.length == 0){
    var err = new Error("Snippet was not found for given selector:" + selector);
    console.error(err);
  }
}

Snippet.prototype.discard = function(){
  this.root.remove();
}

Snippet.prototype.createBindingContext = function(){
  var THIS = this;
  return {
    snippet: THIS
  };
}

Snippet.prototype.find = function(selector){
  return util.findWithRoot(this.root, selector);
}

Snippet.prototype.on = function (event, selector, fn) {
  this._root.on(event, selector, function(){
    fn.apply(this, arguments);
    util.sync();
  });
  return this;
}

module.exports = Snippet;