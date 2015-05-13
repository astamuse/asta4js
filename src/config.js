"use strict";

module.exports = {
  log : true,
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
};

