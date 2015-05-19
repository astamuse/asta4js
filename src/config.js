"use strict";

//to avoid unit test failed on lacking of global reference
var _global = window ? window : {};

module.exports = {
  $: _global.jQuery,
  debug : true,
  autoSyncAfterJqueryAjax: true,
  meta  : {
    nonObjectMetaConvertor : function(meta){},
    fieldClassifier    : function(fieldName, metaId){},
    rewritterMap          : {},
    typedFormHandler: {
      _render:{},
      _register_dom_change:{}
    },
  },
  scope : {
    create: function(){}
  },
  snippet: {
    resolveRoot: function(arg){}
  },
};

