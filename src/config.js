"use strict";

module.exports = {
  log : true,
  autoSyncAfterJqueryAjax: true,
  meta  : {
    nonObjectMetaConvertor : function(meta){},
    fieldClassifier    : function(fieldName, metaId){},
    rewritterMap          : {}
  },
  scope : {
    create: function(){}
  },
};

