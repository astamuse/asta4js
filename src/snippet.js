"use strict";

var util = require("./util");

var Snippet = function(scope, root, parentSnippet, arrayIndex){
  this._scope = scope;
  this._root = root;
  this._parentSnippet = parentSnippet;
  this._index = arrayIndex;
  this._discarded = false;
  
  this._subSnippets = [];
  this._discardHooks = [];
  
  if(parentSnippet){
    parentSnippet._subSnippets.push(this);
    if(parentSnippet._indexes){
      this._indexes = util.clone(parentSnippet._indexes);
    }
  }
  
  if(this._index || this._index === 0){
    if(!this._indexes){
      this._indexes = [];
    }
    this._indexes.push(this._index);
  }

  if(root.length == 0){
    var err = new Error("Snippet was not found for given selector:" + selector);
    console.error(err);
  }
};

Snippet.prototype.addDiscardHook = function(hook){
  this._discardHooks.push(hook);
}

Snippet.prototype.discard = function(){
  if(!this._discarded){
    for(var i=0;i<this._discardHooks.length;i++){
      this._discardHooks[i]();
    }
    for(var i=0;i<this._subSnippets.length;i++){
      this._subSnippets[i].discard();
    }
    this._root.remove();
  }
  this._discarded = true;
};

Snippet.prototype.removeDiscardedSubSnippets = function(){
  for(var i=this._subSnippets.length-1;i>=0;i--){
    if(this._subSnippets[i]._discarded){
      this._subSnippets.splice(i, 1);
    }
  }
};

Snippet.prototype.bind = function(varRef, meta){
  var context = {};
  context._indexes = this._indexes;
  context._snippet= this;
  this._scope.observe(varRef, meta, context);
  return this;
};

Snippet.prototype.bindMeta = function(meta){
  var context = {};
  context._indexes = this._indexes;
  context._scope = this._scope;
  context._snippet= this;
  this._scope.bindMeta(meta, context);
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