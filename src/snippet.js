"use strict";

var util = require("./util");

var Snippet = function(scope, selector){
  this.root = $(selector);
  if(this.root.length == 0){
    var err = new Error("Snippet was not found for given selector:" + selector);
    console.error(err);
  }
  this.scope = scope;
};

Snippet.prototype.discard = function(){
  this._root.remove();
};

Snippet.prototype.bind = function(varRef, meta){
  var refPath = determineRefPath(this.scope, varRef);
  var monitor = new ValueMonitor(this.scope, refPath);
  
  var context = new BindContext(monitor, this);
  var rewittenMeta = rewriteObserverMeta(refPath, meta);
  
  context.bind(rewittenMeta);

  return this;
};

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