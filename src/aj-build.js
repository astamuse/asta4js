Aj={};

Aj.sync = function(){
  Platform.performMicrotaskCheckpoint();
};

Aj.config = {   
  log : true,
  autoSyncAfterJqueryAjax: true,
  nonObjectMetaConvertor: function(meta){
    var type = typeof meta;
    if(type === "string"){
      return {
        _selector: meta
      }
    }else if (type === "function"){
      return {
        _on_change : meta
      }
    }else{
      throw "Not supported meta data type:" + type
            + "\n"
            + JSON.stringify(meta);
    }
  },
  metaFieldClassifier : function (fieldName, metaId) {
    if (fieldName === "_duplicator"){
      return ["_value", "_splice"];
    }else if (fieldName === "_index") {
      return "_prop";
    } else if (fieldName === "_splice"){
      return "_splice";
    } else if (fieldName.indexOf("_") === 0) {
      return "_value";
    } else {
      return "_prop";
    }
  },
  scopeCreate: function(){
      return new Scope();
  }
  metaRewritter: {},
}

module.exports = Aj;