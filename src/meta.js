var config=require("./config");
var constant = require("./constant")

var util=require("./util");

var __reverseMetaKeys = ["_meta_type", "_meta_id", "_meta_trace_id", "_value", "_prop", "_splice", "_target_path"];

var ordered_metaRewritter = null;
var getOrderedMetaRewritter = function(){
  if(ordered_metaRewritter){
    return ordered_metaRewritter;
  }
  
  var array = new Array();
  for (var k in Aj.config.metaRewritter) {
    var def = Aj.config.metaRewritter[k];
    var _priority = null;
    var _fn = null;
    var _key = null;
    var defType = typeof def;
    if (defType === "object") {
      _priority = def.priority;
      _fn = def.fn;
      _key = def.key;
    } else if(defType === "function"){
      _fn = def;
    } else{
      throw "Object or function expected but got:" + defType
            + "\n"
            + JSON.stringify(def);
    }
    
    if(!_priority){
      _priority = 100;
    }
    if(!_fn){
      throw "fn of meta rewritter cannot be empty";
    }
    if(!_key){
      _key = k;
    }
    
    array.push({
      key : _key,
      fn : _fn,
      priority : _priority
    });
  } //end k loop
  //order the array
  array.sort(function (a, b) {
    if (a.priority === b.priority) {
      return a.key.localeCompare(b.key);
    } else {
      return a.priority - b.priority;
    }
  });
  __ordered_metaRewritter = array;
  return __ordered_metaRewritter;
};

//rewrite all the definition
var createAndRetrieveSubMetaRef = function(meta, subType){
  var ref;
  var sub = meta[subType];
  if(Array.isArray(sub)){
    ref = {};
    sub.push(ref);
  }else if (sub){
    var t = typeof sub;
    if(t === "object"){
       meta[subType] = [];
       meta[subType].push(sub);
      ref = sub;
    }else {
      meta[subType] = [];
      meta[subType].push(sub);
      ref = {};
      meta[subType].push(ref);
    }
  }else{
    ref = {};
    meta[subType] = [];
    meta[subType].push(ref);
  }
  return ref;
};


var rewriteObserverMeta = function(propertyPath, meta, metaId){
  
  if(Array.isArray(meta)){
    return meta.map(function(m){
      return rewriteObserverMeta(propertyPath, m, metaId);
    });
  }
  
   //convert function to standard meta format
  var newMeta = util.clone(meta);
  
  if(typeof newMeta !== "object"){
    newMeta = config.meta.nonObjectMetaConvertor(newMeta);
  }

  if(newMeta._meta_type){
    //do nothing
  }else{
    newMeta._meta_type = "_root";
  }
  if(!newMeta._meta_id){
    if(metaId){
      newMeta._meta_id = metaId;
    }else{
      newMeta._meta_id = util.createUID();
    }
  }
  
  newMeta._meta_trace_id = util.createUID();

  switch(newMeta._meta_type){
    case "_root":
      var subMetas = ["_value", "_prop", "_splice"];
      var subRefs = {
        _value  : createAndRetrieveSubMetaRef(newMeta, "_value"),
        _prop   : createAndRetrieveSubMetaRef(newMeta, "_prop"),
        _splice : createAndRetrieveSubMetaRef(newMeta, "_splice"),
      };
      for(var k in newMeta){
        if(__reverseMetaKeys.indexOf(k) >= 0){
          continue;
        }
        var moveTarget = config.meta.fieldClassifier(k);
        
        if(!Array.isArray(moveTarget)){
          moveTarget = [moveTarget];
        }
        for(var i=0;i<moveTarget.length;i++){
          var targetRef = subRefs[moveTarget[i]];
          if(targetRef){
            if(i > 0){
              targetRef[k] = util.clone(newMeta[k]);
            }else{
              targetRef[k] = newMeta[k];
            }
          }else{
            throw "fieldClassifier can only return '_value' or '_prop' or '_splice' rather than '" + moveTarget[i] + "'";
          }
        }
        newMeta[k] = null;
        delete newMeta[k];
      }
      for(var subIdx in subMetas){
        var subMetak = subMetas[subIdx];
        var subMeta = newMeta[subMetak];
        //make sure meta type is right
        for(var i in subMeta){//must be array due to the createAndRetrieveSubMetaRef
          var sm = subMeta[i];
          var t = typeof sm;
          if(t === "object"){
            sm._meta_type = subMetak;
          }else {
            subMeta[i] = config.meta.nonObjectMetaConvertor(subMeta[i]);
            subMeta[i]._meta_type = subMetak;
          }
          subMeta[i]._target_path = propertyPath;
        }
        newMeta[subMetak] = rewriteObserverMeta(propertyPath, subMeta, newMeta._meta_id);
      }
    break;
    case "_splice":
    case "_value":
      //now we will call the registered meta rewritter to rewrite the meta
      
      if(newMeta._meta_type === "_value"){
        //array binding
        var itemMeta = newMeta._item;
        if(itemMeta){
          var itemPath = newMeta._target_path + "[?]";
          newMeta._item = rewriteObserverMeta(itemPath, itemMeta, newMeta._meta_id);
        }
      }
      
      //post binding
      if(newMeta._post_binding){
        if(!Array.isArray(newMeta._post_binding)){
          throw "_post_binding must be array but we got:" + JSON.stringify(newMeta._post_binding);
        }
        //else is OK
      }else{
        newMeta._post_binding = [];
      }
      
      getOrderedMetaRewritter().forEach(function (mr) {
        var m = newMeta[mr.key];
        if (m !== undefined && m !== null) {
          mr.fn(newMeta);
          newMeta[mr.key] = null;
          delete newMeta[mr.key];
        }
      });
      
      if(newMeta._change_handler_creator || newMeta._item){
        if(!newMeta._register_on_change){
          //by default, we treat the bindContext as scope
          var propertyPath = newMeta._target_path;
          newMeta._register_on_change = function (bindContext, changeHandler) {
            var scope = bindContext._scope;
            var arrayIndexedPath = util.replaceIndexesInPath(propertyPath, bindContext._indexes);
            var observer = scope.registerPathObserver(arrayIndexedPath, function(newValue, oldValue){
              changeHandler(newValue, oldValue, bindContext);
            }, newMeta._meta_trace_id);
            if(bindContext.addDiscardHook){
              bindContext.addDiscardHook(function(){
                observer.close();
              })
            }
            var observePath = Path.get(arrayIndexedPath);
            return function(){
              changeHandler(observePath.getValueFrom(scope), undefined, bindContext);
            };
          };
          if(newMeta._item){
            var changeHandlerCreator = newMeta._change_handler_creator;
            var itemMeta = newMeta._item;
            newMeta._change_handler_creator = function(bindContext){
              var existingChangeFn = changeHandlerCreator ? changeHandlerCreator.call(this, bindContext) : undefined;
              return function(newValue, oldValue, bindContext){
                var scope = bindContext._scope;
                if(existingChangeFn){
                  existingChangeFn.call(this, arguments);
                }
                //regiser _item change
                
                var regularOld = util.regulateArray(oldValue);
                var regularNew = util.regulateArray(newValue);
                
                for(var i=regularOld.length;i<regularNew.length;i++){
                  var arrayedContext = util.shallowCopy(bindContext);
                  if(!arrayedContext._indexes){
                    arrayedContext._indexes = [];
                  }
                  arrayedContext._indexes.push(i);
                  //var itemPath = util.replaceIndexesInPath(itemMeta._target_path, arrayedContext.__indexes);
                  //scope.removePathObserver(itemPath, )
                  scope.bindMeta(itemMeta, arrayedContext);
                }
                //currently we have no way to unbound them....
                /*
                for(var i=regularNew.length;i<regularOld.length;i++){
                  var arrayedContext = util.shallowCopy(bindContext);
                  if(!arrayedContext.__indexes){
                    arrayedContext.__indexes = [];
                  }
                  arrayedContext.__index.push(i);
                  var itemPath = util.replaceIndexesInPath(itemMeta._target_path, arrayedContext.__indexes);
                  scope.removePathObserver(itemPath, )
                }
                */
                
                var arrayIndexedPath = util.replaceIndexesInPath(propertyPath, bindContext._indexes);
                if(oldValue){
                  scope.removeArrayObserver(arrayIndexedPath, newMeta._meta_trace_id);
                }
                if(newValue){
                  scope.registerArrayObserver(arrayIndexedPath, newValue, function(splices){
                    //delay(function(){;
                      var removedCount = 0;
                      var addedCount = 0;

                      splices.forEach(function (s) {
                        removedCount += s.removed.length;
                        addedCount += s.addedCount;
                      });

                      var diff = addedCount - removedCount;
                      var newLength = newValue.length;
                      if(diff > 0){
                        for (var i = diff; i >0; i--) {
                          var newIndex = newLength - i;
                          var arrayedContext = util.shallowCopy(bindContext);
                          if(!arrayedContext._indexes){
                            arrayedContext._indexes = [];
                          }
                          arrayedContext._indexes.push(newIndex);
                          //var itemPath = util.replaceIndexesInPath(itemMeta._target_path, arrayedContext.__indexes);
                          //scope.removePathObserver(itemPath, )
                          scope.bindMeta(itemMeta, arrayedContext);
                        }
                      }
                    //});
                  }, newMeta._meta_trace_id);
                };
              };
            };
          }

          if(newMeta._meta_type == "_splice"){
            var spliceChangeHandlerCreator = newMeta._change_handler_creator;
            newMeta._change_handler_creator = function(bindContext){
              var spliceFn = spliceChangeHandlerCreator.call(this, bindContext);
              return function(newValue, oldValue, bindContext){
                var scope = bindContext._scope;
                var arrayIndexedPath = util.replaceIndexesInPath(propertyPath, bindContext._indexes);
                if(oldValue){
                  scope.removeArrayObserver(arrayIndexedPath, newMeta._meta_trace_id);
                }
                if(newValue){
                  scope.registerArrayObserver(arrayIndexedPath, newValue, function(splices){
                    spliceFn.call(newMeta, splices, bindContext);
                  }, newMeta._meta_trace_id);
                };
              }
            }
          }
        }
      }
      //set default assign even we do not need it
      if(!newMeta._assign_change_handler_creator){
        var propertyPath = newMeta._target_path;
        newMeta._assign_change_handler_creator = function(bindContext){
          var scope = bindContext._scope;
          var arrayedPath = util.replaceIndexesInPath(propertyPath, bindContext._indexes);
          var path = Path.get(arrayedPath);
          return function(value, bindContext){
            path.setValueFrom(scope, value);
          };
        }
      }
      
    break;
    case "_prop":
      for(var p in newMeta){
        if(__reverseMetaKeys.indexOf(p) >= 0){
          continue;
        }
        var ppm = newMeta[p];
        if(ppm.nonMeta){
          continue;
        }
        if(p === "_index"){
          newMeta[p] = rewriteObserverMeta(p, ppm);
        }else{
          newMeta[p] = rewriteObserverMeta(propertyPath + "." + p, ppm);
        }
      }
    break;
    default :
      throw "impossible meta type:" + newMeta._meta_type;
  }
  return newMeta;
};

var _on_change = function(meta){
  var changeFn = meta._on_change;
  //if _on_change is specified, the _change_handler_creator will be forced to handle _on_change
  meta._change_handler_creator = function(bindContext){
    return changeFn;
  }
};

var _assign = function(meta){
  var changeFn = meta._assign;
  var propertyPath = meta._target_path;
  //if _assign is specified, the _assign_change_handler_creator will be forced to handle _on_change
  meta._assign_change_handler_creator = function(bindContext){
    var scope = bindContext;
    var arrayedPath = __replaceIndexesInPath(propertyPath, bindContext._indexes);
    var path = Path.get(arrayedPath);
    return function(value, bindContext){
      changeFn(path, value, bindContext);
    };
  }
};

//default config
config.meta.nonObjectMetaConvertor = function(meta){
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
};

config.meta.fieldClassifier = function (fieldName, metaId) {
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
};

config.meta.rewritterMap["_on_change"] = {
  priority : constant.metaRewritterPriority["_on_change"],
  fn : _on_change
};

config.meta.rewritterMap["_assign"] = {
  priority : constant.metaRewritterPriority["_assign"],
  fn : _assign
};

module.exports = rewriteObserverMeta;