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

Aj.init = require("./init");

Aj.delay=Aj.util.delay;

Aj.nest = require("./nestedBinding");



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

//following is for debug purpose, don't access it in client source.
Aj.__internal__ = {};

Aj.__internal__.Observe=require("../lib/observe")


module.exports = Aj;