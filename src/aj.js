"use strict";

var util = require("./util");
var shallow = util.shallowCopy;

var Aj={};

//basic apis
Aj.config = require('./config');

var $ = Aj.config.$;

Aj.util = shallow(util, {}, [
  "createUID",
  "clone",
  "delay",
]);

Aj.sync = util.sync;

Aj.arrayUtil = require("./arrayUtil");

Aj.init = function(initFunc){
  var scope = Aj.config.scope.create();
  initFunc(scope);
}

Aj.delay=Aj.util.delay;



//entry point
require("./scope");

//internal extension
require("./watch");
require("./form");
shallow(require("./dom-bind").api, Aj);
shallow(require("./form-api"), Aj);

if($){
  if(Aj.config.autoSyncAfterJqueryAjax){
    $( document ).ajaxComplete(function() {
      Aj.sync();
    });
  }
}

module.exports = Aj;