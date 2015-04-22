"use strict";

var util = require("./util");
var shallow = util.shallowCopy;

var Aj={};

//basic apis
Aj.config = require('./config');

Aj.util = shallow(util, {}, [
  "createUID",
  "regulateArray",
  "clone",
  "arraySwap",
  "arrayLengthAdjust",
  "delay",
]);

Aj.sync = util.sync;

Aj.init = function(initFunc){
  var scope = Aj.config.scope.create();
  initFunc(scope);
}

Aj.delay=Aj.util.delay;

//entry point
require("./scope");

//internal extension
require("./dom-bind");
require("./watch");
require("./form");

shallow(require("./form-api"), Aj);

if($){
  $(function(){
    if(Aj.config.autoSyncAfterJqueryAjax){
      $( document ).ajaxComplete(function() {
        Aj.sync();
      });
    }
  });
}

module.exports = Aj;