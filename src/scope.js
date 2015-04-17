"use strict";

var util = require("./util");
var config = require("./config");
var Snippet = require("./snippet");
var rewriteObserverMeta = require("./meta");

var BindContext = require("./bind-context");
var ValueMonitor = require("./value-monitor");


var Scope = function(){
};

var createValueMonitorContext=function(scope, varRef){

  var refPath = util.determineRefPath(scope, varRef);
  var monitor = new ValueMonitor(scope, refPath);
  
  return {
    valueMonitor: monitor
  };

}

var createSnippetContext=function(snippet){
  return {
    snippet: snippet
  };
}

Scope.prototype.observe = function(varRef, meta){
  var context = createValueMonitorContext(this, varRef);
  var bindContext = new BindContext(context);
  bindContext.bind(meta);
}


Scope.prototype.snippet = function(selector){
  var scope = this;
  var snippet = new Snippet(selector);
  snippet.bind = function(varRef, meta){
    var context = createValueMonitorContext(scope, varRef);
    context = util.shallowCopy(createSnippetContext(snippet), context);
    var bindContext = new BindContext(context);
    bindContext.bind(meta);
    return this;
  };
  return snippet;
}

config.scope.create=function(){
  return new Scope();
}