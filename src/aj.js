"use strict";

(function(){
  var Aj = {
    sync : function () {
      //setTimeout(function(){
      Platform.performMicrotaskCheckpoint();
      //},0);
    },
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
    metaRewritter: {
      _form : function (meta) {
        var formDef = meta._form;
        var propertyPath = meta._target_path;
        
        if (typeof formDef === "string") {
          formDef = {
            _name : formDef
          };
        }
        
        if(!formDef._name){
          var lastDotIndex = propertyPath.lastIndexOf(".");
          formDef._name = propertyPath.substr(lastDotIndex+1);
        }

        if (!meta._selector) {
          meta._selector = "[name=" + formDef._name + "]";
        }

        if (!meta._render) {
          meta._render = function (target, newValue, oldValue, bindContext) {
            //TODO we need to do more for select/checkbox/radio
            var tagName = target.prop("tagName");
            switch (tagName) {
            case "SELECT":
              //move diverge value option at first
              target.find("[aj-diverge-value]").remove();
              target.val(newValue);
              var domValue = target.val();
              console.log("domValue=" + domValue);
              if (domValue === null) { //which means there is no corresponding option
                var op = $("<option aj-diverge-value>").val(newValue).text(newValue);
                console.log(op);
                target.append(op);
                target.val(newValue);
              }
              break;
            case "INPUT":
              var type = target.attr("type");
              if(type){
                type = type.toLowerCase();
              }
              if(type === "checkbox" || type === "radio"){
                if(formDef._single_check){
                  if(newValue){
                    target.prop("checked", true);
                  }else{
                    target.prop("checked", false);
                  }
                }else{
                  var va = Aj.util.regulateArray(newValue);
                  if(type === "radio" && va.length > 1){
                    throw "There are over than one candidate value for radio:" + va;
                  }
                  var unmatchedValue = [];
                  //there must be "aj-placeholder-id"
                  var placeHolderId = target.attr("aj-placeholder-id");
                  
                  if(!placeHolderId){//option bind has not been called yet or static option
                    return;
                  }
                  
                  var snippet = bindContext._snippet;
                  
                  //remove the auto generated diverge elements
                  snippet.find("[aj-diverge-value=" + placeHolderId + "]").remove();
                  
                  //find out all the existing options
                  var ops = snippet.find("[aj-generated=" + placeHolderId + "]");
                  Aj.util.findWithRoot(ops, "input[type="+type+"]").prop("checked", false);
                  va.forEach(function(v){
                    if(v === null || v === undefined){
                      v = "";
                    }
                    var foundInput = Aj.util.findWithRoot(ops, "input[value='"+v+"']");
                    if(foundInput.length === 0){
                      if(v){
                        unmatchedValue.push(v);
                      }
                    }else{
                      foundInput.prop("checked", true);
                    }
                  });
                  if(unmatchedValue.length > 0){
                    var insertPoint = snippet.find("#" + placeHolderId);
                    unmatchedValue.forEach(function(v){
                      var uid = Aj.util.createUID();
                      var clone = target.clone().attr("id", uid).val(v).prop("checked", true);
                      var label = $("<label>").attr("for",uid).text(v);
                      
                      var diverge = $("<span>").attr("aj-diverge-value", placeHolderId);
                      diverge.append(clone).append(label);
                      
                      insertPoint.after(diverge);
                      insertPoint = diverge;
                    });
                  }
                }
                break;
              }else{
                //continue to default
              }
            default:
              target.val(newValue);
            } //end switch
            
            //save the current value to target as data attribute
            __getDataRef(target, "aj-form-binding-ref").value = newValue;
          } // end _render = function...
        } // end !meta._render

        if (formDef._option) {
          var renderFn = meta._render;
          meta._post_binding.push(function (context) {
            var scope = context._scope;
            var ownerSnippet = context._snippet;
            var target = ownerSnippet.find(meta._selector);
            var optionSnippet = formDef._option.bindAsSubSnippet(scope, target, function () {
              var currentDomValue = __getDataRef(target, "aj-form-binding-ref").value;
              renderFn(target, currentDomValue, undefined, context);
            });
            ownerSnippet._discardHooks.push(function(){
              optionSnippet.discard();
            });
          });
        }
        
        if (!meta._register_dom_change) {
          var changeEvents = new Array();

          var defaultChangeEvent = formDef._default_change_event;
          if (defaultChangeEvent === undefined) {
            changeEvents.push("blur");
          } else if (defaultChangeEvent) {
            changeEvents.push(defaultChangeEvent);
          }

          var extraChangeEvents = formDef._extra_change_events;
          extraChangeEvents = Aj.util.regulateArray(extraChangeEvents);
          Array.prototype.push.apply(changeEvents, extraChangeEvents);
          

          if (changeEvents.length > 0) {
            meta._register_dom_change = function (scope, propertyPath, snippet, selector, changeHandler, bindContext) {
              var target = snippet.find(selector);
              var ref = __getDataRef(target, "aj-form-binding-ref");
              ref.changeEvents = changeEvents;

              var inputType;
              var tagName = target.prop("tagName");
              if(tagName === "INPUT"){
                inputType = target.attr("type");
                if(inputType){
                  inputType = inputType.toLowerCase();
                }
              }
              
              var observePath = Path.get(propertyPath);
              var passToHandler = {
                observePath: observePath,
                scope: scope
              };
              if(inputType === "checkbox" || inputType === "radio"){
                if(formDef._single_check){
                  target.bind(changeEvents.join(" "), function () {
                    var v = $(this).prop("checked");
                    changeHandler(passToHandler, v);
                  }); 
                }else{
                  var observer = new PathObserver(ref, "value");
                  observer.open(function(newValue, oldValue){
                    changeHandler(passToHandler, newValue);
                  });
                  snippet._discardHooks.push(function(){
                    observer.close();
                  });
                }
              }else{
                target.bind(changeEvents.join(" "), function () {
                  var v = $(this).val();
                  changeHandler(passToHandler, v);
                }); 
              }
            }// end meta._register_assign
          };// end changeEvents.length > 0
        }// end !meta._register_assign
      },// end _form
      _duplicator : {
        fn : function(meta){
          var _duplicator = meta._duplicator;
          var propertyPath = meta._target_path;
          if(!meta._register_on_change){
            meta._register_on_change = function(bindContext, changeHandler){
              var snippet = bindContext._snippet;
              var scope = bindContext._scope;
              var forceChange = [];
              if(meta._meta_type === "_value"){
                var target = snippet.find(_duplicator);
                if (target.length == 0) {
                  throw "could not find duplicator:" + originalMeta._duplicator;
                }
                
                target.each(function(index, elem){
                  var tagName = elem.tagName;
                  var placeHolderId = Aj.util.createUID();
                  if( (tagName === "OPTION" || tagName === "OPTGROUP") && $.browser !== "mozilla"){
                    tagName = "span";
                  }
                  var placeHolder = $("<" + tagName + " style='display:none' id='" + placeHolderId + "' value='SFDASF#$#RDFVC%&!#$%%2345sadfasfd'/>");
                  var $elem = $(elem);
                  $elem.after(placeHolder);

                  //$elem.attr("aj-placeholder-id",placeHolderId);
                  //remove the duplicate target
                  $elem.remove();
                  $elem.attr("aj-generated", placeHolderId);

                  var templateStr = $("<div>").append($elem).html();
                  
                  //set the placeholder id to all the children input elements for the sake of checkbox/radio box option rendering
                  $elem.find("input").attr("aj-placeholder-id", placeHolderId);
                  var changeContext = Aj.util.shallowCopy(bindContext);
                  changeContext._placeHolder = placeHolder;
                  changeContext._templateStr = templateStr;
                  changeContext._indexedPath = __replaceIndexesInPath(propertyPath, bindContext._indexes);
                  var observer = scope.registerPathObserver(changeContext._indexedPath, function(newValue, oldValue){
                    changeHandler(changeContext, newValue, oldValue);
                  });
                  snippet._discardHooks.push(function(){
                    observer.close();
                  });
                  var observePath = Path.get(changeContext._indexedPath);
                  forceChange.push(function(){
                    var v = observePath.getValueFrom(scope);
                    changeHandler(changeContext, v, undefined);
                  });
                });//end target each
              }

              return function(){
                forceChange.forEach(function(f){
                  f.apply();
                });
              }
            }
          }
          if(!meta._on_change){
            if(meta._meta_type === "_value"){
              meta._on_change = function(context, newValue, oldValue){
                var scope = context._scope;
                var snippet = context._snippet;
                var target = context._target;
                var placeHolder = context._placeHolder;
                var templateStr = context._templateStr;
                var currentPath = context._indexedPath;
                var itemMeta = this._item;
                
                var regularOld = Aj.util.regulateArray(oldValue);
                var regularNew = Aj.util.regulateArray(newValue);
                
                //var existingNodes = snippet._root.find("[aj-generated=" + placeHolderId + "]");
                var existingSubSnippets = __getDataRef(placeHolder, "aj-place-holder-ref").subSnippets;
                if(!existingSubSnippets){
                  existingSubSnippets = [];
                  __getDataRef(placeHolder, "aj-place-holder-ref").subSnippets = existingSubSnippets;
                }

                var newLength = regularNew.length;
                var existingLength = existingSubSnippets.length;

   

                var insertPoint = placeHolder;
                if(existingLength > 0){
                  insertPoint = existingSubSnippets[existingLength-1]._root;
                }
                
                //add new snippets
                for (var i=existingLength; i < newLength; i++) {
                  var childElem = $(templateStr);
                  insertPoint.after(childElem);

                  //recursive binding
                  var childSnippet = new Snippet(snippet._scope, childElem, snippet, i);
                  childSnippet.bindMeta(itemMeta);
                  insertPoint = childElem;
                  
                  existingSubSnippets.push(childSnippet);

                } // end i

                //remove redundant snippets
                for (var j=existingLength-1; j >= newLength; j--) {
                  existingSubSnippets[j].discard();
                }
                
                if(existingLength>newLength){
                  existingSubSnippets.splice(newLength-1, existingLength - newLength);
                  snippet.removeDiscardedSubSnippets();
                }
                if(oldValue){
                  scope.removeArrayObserver(currentPath, oldValue);
                }
                if(newValue){
                  scope.registerArrayObserver(currentPath, newValue, function(splices){
                    var removedCount = 0;
                    var addedCount = 0;

                    splices.forEach(function (s) {
                      removedCount += s.removed.length;
                      addedCount += s.addedCount;
                    });

                    var diff = addedCount - removedCount;
                    var existingLength = existingSubSnippets.length;
                    if(diff > 0){
                      //we simply add the new child to the last of current children list,
                      //all the values will be synchronized correctly since we bind them
                      //by a string value path rather than the real object reference
                      var insertPoint;
                      if(existingLength>0){
                        insertPoint = existingSubSnippets[existingLength-1]._root;
                      }else{
                        insertPoint = placeHolder;
                      }
                      for (var i = 0; i < diff; i++) {
                        var childElem = $(templateStr);
                        insertPoint.after(childElem);

                        //recursive binding
                        var childSnippet = new Snippet(snippet._scope, childElem, snippet, existingLength+i);
                        childSnippet.bindMeta(itemMeta);
                        insertPoint = childElem;
                        
                        existingSubSnippets.push(childSnippet);
                      }
                    }else if (diff < 0){
                      diff = 0 - diff;
                      for (var i = 1; i <= diff; i++) {
                        existingSubSnippets[existingLength - i].discard();
                      }
                      existingSubSnippets.splice(existingLength-diff, diff);
                      snippet.removeDiscardedSubSnippets();
                    }
                    if(meta._post_render){
                      meta._post_render();
                    }
                  });//end array(splice) observe
                }
                if(meta._post_render){
                  meta._post_render();
                }
              }//end meta._on_change
            }else{
              meta._on_change = function(){};
            }
          }
        }//end fn
      },//end _duplicator
      _selector : {
        priority : 10000000 - 700, 
        fn : function (meta) {
          //rewrite selector to extract attr operations
          var attrOpIndex = meta._selector.indexOf("@>");
          if (attrOpIndex >= 0) {
            meta._attr_op = meta._selector.substr(attrOpIndex + 2);
            meta._selector = meta._selector.substring(0, attrOpIndex);
          }
          meta._selector_after_attr_op = meta._selector;
        }
      },
      _attr_op : {
        priority : 10000000 - 600, // bigger than bigger
        fn : function (meta){
          var attrOp = meta._attr_op;
          //set default 1 way binding
          if (!meta._render && attrOp) {
            var attrRegs = [{
                comment : "style equal",
                reg : /^\[style\:(.+)=\]$/,
                renderFn : function (matched) {
                  return function (target, newValue, oldValue) {
                    target.css(matched, newValue);
                  };
                }
              }, {
                comment : "class switch",
                reg : /^\[class:\((.+)\)\?\]$/,
                renderFn : function (matched) {
                  var classes = matched.split("|");
                  return function (target, newValue, oldValue) {
                    if (newValue === undefined
                       || newValue === ""
                       || newValue == null
                       || classes.indexOf(newValue) >= 0) {
                      classes.forEach(function (c) {
                        target.removeClass(c);
                      });
                      if (newValue) {
                        target.addClass(newValue);
                      }
                    } else {
                      throw "the specified css class name:'"
                       + newValue
                       + "' is not contained in the declared switching list:"
                       + meta._selector;
                    }
                  };
                }
              }, {
                comment : "class existing",
                reg : /^\[class:(.+)\?\]$/,
                renderFn : function (matched) {
                  return function (target, newValue, oldValue) {
                    if (newValue) {
                      target.addClass(matched);
                    } else {
                      target.removeClass(matched);
                    }
                  };
                }
              }, {
                comment : "attr equal",
                reg : /^\[(.+)=\]$/,
                renderFn : function (matched) {
                  return function (target, newValue, oldValue) {
                    target.attr(matched, newValue);
                  };
                }
              }, {
                comment : "attr existing",
                reg : /^\[(.+)\?\]$/,
                renderFn : function (matched) {
                  return function (target, newValue, oldValue) {
                    target.prop(matched, newValue);
                  };
                }
              }
            ];

            var renderFn = null;
            Aj.log("attrOp=" + attrOp);
            for (var i = 0; i < attrRegs.length; i++) {
              var attrReg = attrRegs[i];
              var matchResult = attrReg.reg.exec(attrOp);
              if (matchResult) {
                Aj.log("matched");
                Aj.log(attrReg);
                var matched = matchResult[1];
                renderFn = attrReg.renderFn(matched);
                break;
              }
              //Aj.log("not matched");
            }

            if (renderFn) {
              meta._render = renderFn;
            } else {
              throw "not supported attr operation:" + attrOp;
            }
          }
        }
      }, // end _attr_op
      _selector_after_attr_op : {
        priority : 10000000 - 500, 
        fn : function (meta) {
          if (!meta._render) {
            meta._render = function (target, newValue, oldValue, bindContext) {
              if(newValue === null || newValue === undefined){
                newValue = "";
              }
              target.text(newValue);
            };
          }
          if(!meta._register_render){
            meta._register_render = function(scope, propertyPath, snippet, selector, changeHandler, bindContext){
              var target = snippet.find(selector);
              if(propertyPath === "_index"){
                //we do not need to observe anything, just return a force render handler
                return function(){
                  changeHandler(target, snippet._index, undefined, bindContext);
                }
              }else if (propertyPath == "_indexes"){
                //we do not need to observe anything, just return a force render handler
                return function(){
                  changeHandler(target, snippet._indexes, undefined, bindContext);
                }
              }else{
                var observer = scope.registerPathObserver(propertyPath, function(newValue, oldValue){
                  changeHandler(target, newValue, oldValue, bindContext);
                });
                
                snippet._discardHooks.push(function(){
                  observer.close();
                });
                
                var observePath = Path.get(propertyPath);
                return function(){
                  changeHandler(target, observePath.getValueFrom(scope), undefined, bindContext);
                }
              }
            }
          }
          if(!meta._on_dom_change){//even we do not need it
            meta._on_dom_change = function(target, value, bindContext){
              //try our best to 
              if(target.setValue){
                target.setValue(value);
              }else if(target.observePath && target.scope){
                target.observePath.setValueFrom(target.scope, value);
              }else if(target.propertyPath && target.scope){
                Pat.get(target.propertyPath).setValueFrom(target.scope, value);
              }
            }
          }
          
          //revive _selector because we will need it later
          meta._selector = meta._selector_after_attr_op;
        }
      },
      _render : {
        priority : 10000000 -400, // a little smaller than bigger
        fn : function (meta) {
          if(!meta._on_change){
            meta._on_change = meta._render;
          }
        }
      },
      _register_render : {
        priority : 10000000 - 300, // a little smaller than bigger
        fn : function (meta) {
          if(!meta._register_on_change){
            var _register_render = meta._register_render;
            var selector = meta._selector;
            var propertyPath = meta._target_path;
            meta._register_on_change = function(bindContext, changeHandler){
              var scope = bindContext._scope;
              var snippet = bindContext._snippet;
              var arrayedPath = __replaceIndexesInPath(propertyPath, bindContext._indexes);
              return _register_render(scope, arrayedPath, snippet, selector, changeHandler, bindContext);
            }
          }
        }
      },
      _on_dom_change : {
        priority : 10000000 - 200, // a little smaller than bigger
        fn : function (meta) {
          if(!meta._assign){
            meta._assign = meta._on_dom_change;
          }
        }
      },
      _register_dom_change : {
        priority : 10000000 - 100, // a little smaller than bigger
        fn : function (meta) {
          if (!meta._register_assign) {
            var _register_dom_change = meta._register_dom_change;
            var selector = meta._selector;
            var propertyPath = meta._target_path;
            meta._register_assign = function(bindContext, changeHandler){
              var scope = bindContext._scope;
              var snippet = bindContext._snippet;
              var arrayedPath = __replaceIndexesInPath(propertyPath, bindContext._indexes);
              return _register_dom_change(scope, arrayedPath, snippet, selector, changeHandler, bindContext);
            }
          }
        }
      },
      /*
      _selector_keep_to_final : {
        priority : 10000000, // a little smaller than bigger
        fn : function(){} //do nothing
      }
      */
    },
    scopeCreate: function(){
      return new Scope();
    }
  };
  
  Aj.log = Aj.config.log ? function(){
    console.log.apply(console, arguments);
  } : function(){};
  
  var __ordered_metaRewritter = null;
  var __getOrderedMetaRewritter = function(){
    if(__ordered_metaRewritter){
      return __ordered_metaRewritter;
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
  
  var __uidSeq = 0;
  Aj.util = {
    createUID : function () {
      __uidSeq++;
      return "AJUID-" + __uidSeq;
    },
    regulateArray : function (v, tryKeepRef) {
      if ($.isArray(v)) {
        if(tryKeepRef){
          return v;
        }else{
          return [].concat(v);
        }
      } else if (v === null || v === undefined) {
        return new Array();
      } else {
        return [v];
      }
    },
    clone : function (obj) {
      return clone(obj);
    },
    shallowCopy: function(obj){
      var ret = {};
      for(var k in obj){
        ret[k] = obj[k];
      }
      return ret;
    },
    arraySwap : function (array, index1, index2) {
      var tmp = array[index1];
      array[index1] = array[index2];
      array[index2] = tmp;
    },
    findWithRoot: function(rootElem, selector){
      if(selector === ":root"){
        return rootElem;
      }
      var result = rootElem.find(selector);
      if(result.length === 0){
        if(rootElem.is(selector)){
          return rootElem;
        }
      }
      return result;
    }
  };
  
  var __element_ref_map = {};
  var __getDataRef = function(jqueryObject, dataAttrName){
    var elementRefId = jqueryObject.attr("aj-element-ref-id");
    if(!elementRefId){
      elementRefId = Aj.util.createUID();
      jqueryObject.attr("aj-element-ref-id", elementRefId);
    }
    var refMap = __element_ref_map[elementRefId];
    if(!refMap){
      refMap = {};
      __element_ref_map[elementRefId] = refMap;
    }
    var dataRef = refMap[dataAttrName];
    if(!dataRef){
      dataRef = {
          _trace_id: Aj.util.createUID()
      };
      refMap[dataAttrName] = dataRef;
      Aj.log("create ref:" + dataRef._trace_id + " for " + jqueryObject[0].outerHTML);
    }
    return dataRef;
  };
  
  Aj.init = function(initFunc){
    var scope = Aj.config.scopeCreate();
    initFunc(scope);
  }
  
  //scope
  
  //rewrite all the definition
  var __createAndRetrieveSubMetaRef = function(meta, subType){
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
  var __reverseMetaKeys = ["_meta_type", "_meta_id", "_value", "_prop", "_splice", "_target_path"];
  var __rewriteObserverMeta = function(propertyPath, meta, metaId){
    
    if(Array.isArray(meta)){
      return meta.map(function(m){
        return __rewriteObserverMeta(propertyPath, m, metaId);
      });
    }
    
     //convert function to standard meta format
    var newMeta = Aj.util.clone(meta);
    
    if(typeof newMeta !== "object"){
      newMeta = Aj.config.nonObjectMetaConvertor(newMeta);
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
        newMeta._meta_id = Aj.util.createUID();
      }
    }

    switch(newMeta._meta_type){
      case "_root":
        var subMetas = ["_value", "_prop", "_splice"];
        var subRefs = {
          _value  : __createAndRetrieveSubMetaRef(newMeta, "_value"),
          _prop   : __createAndRetrieveSubMetaRef(newMeta, "_prop"),
          _splice : __createAndRetrieveSubMetaRef(newMeta, "_splice"),
        };
        for(var k in newMeta){
          if(__reverseMetaKeys.indexOf(k) >= 0){
            continue;
          }
          var moveTarget = Aj.config.metaFieldClassifier(k);
          
          if(!Array.isArray(moveTarget)){
            moveTarget = [moveTarget];
          }
          for(var i=0;i<moveTarget.length;i++){
            var targetRef = subRefs[moveTarget[i]];
            if(targetRef){
              if(i > 0){
                targetRef[k] = Aj.util.clone(newMeta[k]);
              }else{
                targetRef[k] = newMeta[k];
              }
            }else{
              throw "metaFieldClassifier can only return '_value' or '_prop' or '_splice' rather than '" + moveTarget[i] + "'";
            }
          }
          newMeta[k] = null;
          delete newMeta[k];
        }
        for(var subIdx in subMetas){
          var subMetak = subMetas[subIdx];
          var subMeta = newMeta[subMetak];
          //make sure meta type is right
          for(var i in subMeta){//must be array due to the __createAndRetrieveSubMetaRef
            var sm = subMeta[i];
            var t = typeof sm;
            if(t === "object"){
              sm._meta_type = subMetak;
            }else {
              subMeta[i] = Aj.config.nonObjectMetaConvertor(subMeta[i]);
              subMeta[i]._meta_type = subMetak;
            }
            subMeta[i]._target_path = propertyPath;
          }
          newMeta[subMetak] = __rewriteObserverMeta(propertyPath, subMeta, newMeta._meta_id);
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
            newMeta._item = __rewriteObserverMeta(itemPath, itemMeta, newMeta._meta_id);
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
        }
        
        __getOrderedMetaRewritter().forEach(function (mr) {
          var m = newMeta[mr.key];
          if (m !== undefined && m !== null) {
            mr.fn(newMeta);
            newMeta[mr.key] = null;
            delete newMeta[mr.key];
          }
        });
        
        if(newMeta._on_change){
          if(!newMeta._register_on_change){
            //by default, we treat the bindContext as scope
            newMeta._register_on_change = function (bindContext, changeHandler) {
              var scope = bindContext;
              if(newMeta._meta_type === "_value"){
                var observer = scope.registerPathObserver(this._target_path, function(newValue, oldValue){
                  changeHandler(bindContext, newValue, oldValue);
                });
              }else{
                
              };
              if(bindContext.addDiscardHook){
                bindContext.addDiscardHook(function(){
                  observer.close();
                })
              }
              return function(){
                var path = Path.get(this._target_path);
                changeHandler(scope, path.getValueFrom(scope), undefined);
              };
            };
          }
        }
        
        if(!newMeta._assign){//set default assign even we do not need it
          newMeta._assign = function (bindContext, value){
            var scope = bindContext;
            var path = Path.get(this._target_path);
            path.setValueFrom(scope, value);
          };
        }
        
        
        //if(meta._assign && !meta._)
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
            newMeta[p] = __rewriteObserverMeta(p, ppm);
          }else{
            newMeta[p] = __rewriteObserverMeta(propertyPath + "." + p, ppm);
          }
        }
      break;
      default :
        throw "impossible meta type:" + newMeta._meta_type;
    }
    return newMeta;
  };

  
  var ObserverMap = function(){
    this.map = {};
  };
  
  ObserverMap.prototype.add = function(path, observer, extraInfo){
    var item = {
      extraInfo: extraInfo,
      prev: null,
      next: null,
      close: function(){
        observer.close();
        if(this.prev){
          this.prev.next = this.next;
        }
        if(this.next){
          this.next.prev = this.prev;
        }
      }
    };
    var head = this.map[path];
    if(!head){
      head = {
        prev: null,
        next: null,
        close: function(){}
      };
      head.prev = head;
      head.next = head;
      this.map[path] = head;
    }
    var tail = head.prev;
    
    tail.next = item;
    
    item.prev = tail;
    item.next = head;
    
    head.prev = item;
    
    return item;
  }
  
  ObserverMap.prototype.getObserverList = function(path, extraInfo){
    var list = [];
    var head = this.map[path];
    var item = head.next;
    while(item && item != head){
      if(extraInfo){
        if(item.extraInfo == extraInfo){
          list.push(item);
        }
      }else{
        list.push(item);
      }
      item = item.next;
    }
    return list;
  }
  
  var Scope = function(){
    this.observerMap = {
      path: new ObserverMap(),
      splice: new ObserverMap()
    };
  };
  
  var __replaceIndexesInPath=function(path, replaceIndexes){
    if(replaceIndexes){
      for(var i=0;i<replaceIndexes.length;i++){
        path = path.replace("?", replaceIndexes[i]);
      }
    }
    return path;
  }

  Scope.prototype.registerPathObserver = function(path, changeFn){
    var observer = new PathObserver(this, path);
    observer.open(changeFn);
    return this.observerMap.path.add(path, observer);
  };
  
  Scope.prototype.registerArrayObserver = function(path, targetObj, changeFn){
    var observer = new ArrayObserver(targetObj);
    observer.open(changeFn);
    return this.observerMap.splice.add(path, observer, targetObj);
  };
  
  Scope.prototype.removeArrayObserver = function(path, targetObj){
    var list = this.observerMap.splice.getObserverList(path, targetObj);
    for(var i=0;i<list.length;i++){
      list[i].close();
    }
  };

  Scope.prototype.observe = function(varRef, meta, bindContext){
    var refPath = __determineRefPath(this, varRef);
    var rewittenMeta = __rewriteObserverMeta(refPath, meta);
    var context = {};
    if(bindContext){
      //we do not do deep copy, only the first layer
      for(var k in bindContext){
        context[k] = bindContext[k];
      }
    }
    //make sure the scope is current scope
    context._scope = this;
    this.bindMeta(rewittenMeta, context);
  };
  
  Scope.prototype.bindMeta = function(meta, bindContext){
    Aj.log(meta);
    var THIS = this;
    if(Array.isArray(meta)){
      meta.forEach(function(m){
        THIS.bindMeta(m, bindContext);
      });
      return;
    }
    var nonRecursive = ["_value", "_splice"];
    for(var i in nonRecursive){
      var sub = meta[nonRecursive[i]];
      if(!sub){
        continue;
      }
      sub.forEach(function(sm){
        if(sm._register_on_change){
          var force = sm._register_on_change(bindContext, function(){
            sm._on_change.apply(sm, arguments);
          });
          force.apply();
        }
        if(sm._register_assign){
          var force = sm._register_assign(bindContext, function(){
            sm._assign.apply(sm, arguments);
            Aj.sync();
          });
          //force.apply
        }
        if(sm._post_binding){
          sm._post_binding.forEach(function(pb){
            pb.call(sm, bindContext)
          });
        }
      });
    }
    
    var propSub = meta._prop;
    if(!propSub){
      return;
    }
    propSub.forEach(function(ps){
      for(var p in ps){
        var pm = ps[p];
        if(!pm){
          continue;
        }
        THIS.bindMeta(pm, bindContext);
      }
    });
  };
  
  Scope.prototype.snippet = function(selector){
    var root = $(selector);
    return new Snippet(this, root);
  };
  
  
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
        this._indexes = Aj.util.clone(parentSnippet._indexes);
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
      Aj.log(err);
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
    return Aj.util.findWithRoot(this._root, selector);
  }
  
  Snippet.prototype.on = function (event, selector, fn) {
    this._root.on(event, selector, function(){
      fn.apply(this, arguments);
      Aj.sync();
    });
    return this;
  }
  
  var __determineRefPath = function (scope, varRef) {
    var searchKey = "ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";
    varRef[searchKey] = 1;

    var refPath = null;
    for (var p in scope) {
      var ref = scope[p];
      if (ref[searchKey] == 1) {
        refPath = p;
        break;
      }
    }

    varRef[searchKey] = null;
    delete varRef[searchKey];

    return refPath;
  };
  
  /**
   * _varRef : binding reference
   * _meta   : option meta or target binding property name
   * _meta2  : _duplicator
   */
  Aj.optionBind = function (_varRef, _meta, _meta2) {
    var varRef = _varRef;
    var meta;
    if (typeof _meta === "string") {
      meta = {};
      meta[_meta] = {};
    } else {
      meta = Aj.util.clone(_meta);
    }
    
    if(typeof _meta2 === "string"){
      for(var kk in meta){
        meta[kk]._duplicator = _meta2;
      }
    }

    var checkKeys = Object.keys(meta);
    if (checkKeys.length !== 1) {
      throw "There can only be one property declaration in option binding, but got:" + checkKeys;
    }

    var optionMeta = meta[checkKeys[0]];
    var itemDef = optionMeta._item; 
    if (!optionMeta._item) {
      optionMeta._item = {};
    }
    var itemDef = optionMeta._item;
    
    //move all the properties to _item
    for (var p in optionMeta) {
      if (p === "_duplicator" || p === "_item") {
        continue;
      }
      itemDef[p] = optionMeta[p];
      delete optionMeta[p];
    }

    //we do not want there are other properties from "_duplicator" and "_item"
    for (var p in optionMeta) {
      if (p === "_duplicator" || p === "_item") {
        continue;
      }
      throw "Only _duplicator and _item are allowed under option binding but found:" + p;
    }

    
    var valueFn = itemDef._value ? itemDef._value : function (v) {
      if(v.value === undefined){
        return v;
      }else{
        return v.value;
      }
    };
    delete itemDef._value;

    var textFn = itemDef._text ? itemDef._text : function (v) {
      if(v.text === undefined){
        return v;
      }else{
        return v.text;
      }
    };
    delete itemDef._text;

    var op = {};
    op.bindAsSubSnippet = function (scope, ownerFormInputTarget, onOptionChange) {
      var snippetRoot;
      
      //rewrite post render
      //it should be rewritten to simple object observe, but right now, we simply hack it.
      if(optionMeta._post_render){
        var pr = optionMeta._post_render;
        optionMeta._post_render = function(){
          onOptionChange();
          pr();
        }
      }else{
        optionMeta._post_render = onOptionChange;
      }
      
      //rewrite render by type
      var tagName = ownerFormInputTarget.prop("tagName");
      switch (tagName) {
      case "SELECT":
        snippetRoot = ownerFormInputTarget;
        if (!optionMeta._duplicator) {
          optionMeta._duplicator = "option:first"; //we will always use the first option as template
        }

        if (!itemDef._selector) {
          itemDef._selector = ":root";
        }
        if (itemDef._render) {
          var renderFn = itemDef._render;
          itemDef._render = function (target, newValue, oldValue) {
            renderFn(target, newValue, oldValue);
          }
        } else {
          itemDef._render = function (target, newValue) {
            target.val(valueFn(newValue));
            target.text(textFn(newValue));
          };
        }
        break;
      case "INPUT":
        var type = ownerFormInputTarget.attr("type");
        if(type){
          type = type.toLowerCase();
        }
        if(type=== "checkbox" || type === "radio"){
          if (!optionMeta._duplicator) {
            throw "_duplicator must be specified for options of checkbox or radio";
          }

          //find out the parent of duplicator
          var parent = ownerFormInputTarget;
          while(!parent.is(optionMeta._duplicator)){
            parent = parent.parent();
          }
          snippetRoot = parent.parent();
          
          if (!itemDef._selector) {
            itemDef._selector = ":root";
          }
          if(itemDef._register_dom_change || itemDef._dom_change){
            throw "_register_dom_change/_dom_change cannot be specified for checkbox/radio option";
          }else{
            var ref = __getDataRef(ownerFormInputTarget, "aj-form-binding-ref");
            if(ref.changeEvents.length > 0){
              itemDef._register_dom_change = function (scope, propertyPath, snippet, selector, changeHandler, bindContext){
                var events = ref.changeEvents.join(" ");
                var targetInput = snippet.find("input");
                targetInput.bind(events, function () {
                  var je = $(this);
                  var value = je.val();
                  var checked = je.prop("checked");
                  changeHandler(value, checked);
                });
                snippet.find("label").bind(events, function(){
                  var je= $(this);
                  var id = je.attr("for");
                  var input = targetInput.filter("#" + id);
                  var eventHandler = input[ref.changeEvents[0]];
                  eventHandler.apply(input);
                });
              }
              itemDef._on_dom_change = function (value, checked) {
                  if(type === "checkbox"){
                    var newResult = Aj.util.regulateArray(ref.value);
                    var vidx = newResult.indexOf(value);
                    if(checked && vidx>= 0){
                      //it is ok
                    }else if(checked && vidx < 0){
                      //add
                      newResult.push(value);
                    }else if(!checked && vidx >= 0){
                      //remove
                      newResult.splice(vidx, 1);
                    }else{// !checked && vidx < 0
                      //it is ok
                    }
                    ref.value = newResult;
                  }else{
                    ref.value = value;
                  }
                  
                  Aj.sync();
              } //_assign
            } // ref.changeEvents.length > 0
          } // else of (itemDef._register_assign || itemDef._assign)
          if (!itemDef._render) {
            itemDef._render = function (target, newValue, oldValue, bindContext) {
              var snippet = bindContext._snippet;
              var uid = Aj.util.createUID();
              snippet.find("input[type="+type+"]").attr("id", uid).val(valueFn(newValue));;
              snippet.find("label").attr("for", uid).text(textFn(newValue));
            };
          }
          break;
        }else{
          // continue to the default
        }
      default:
        throw "Only select, checkbox or radio can declare _option but found:" + target[0].outerHTML;
      }
      var optionSnippet = new Snippet(scope, snippetRoot);
      optionSnippet.bind(varRef, meta);
      return optionSnippet;
    };
    return op;
  }, //end optionBind

  /**
   * [target]: string->name or selector. object->{_name: ""} or {_selector: ""}
   * [event1]: string->default change event array->extra change events
   * [event2]: array->extra change events
   */
  Aj.form = function(target, event1, event2){
    var selector;
    var name;
    if(target){
      if(typeof target === "string"){
        //treat as name or selector
        selector = "[name="+target+"]"+ ", " + target;
      }else{
        selector = target["selector"];
        name = target["name"];
      }
    }
    var ret = {
      _selector: selector,
      _form: {
        _name: name
      }
    };
    var defaultChangeEvent;
    var extraChangeEvents;
    if(typeof event1 === "string"){
      defaultChangeEvent = event1;
      extraChangeEvents = event2;
    }else if (Array.isArray(event1)){
      extraChangeEvents = event2;
    }
    
    if(defaultChangeEvent){
      ret._form._default_change_event = defaultChangeEvent;
    }
    ret._form._extra_change_events = extraChangeEvents;
    
    ret.withOption = function(){
      this._form._option = Aj.optionBind.apply(Aj, arguments);
      return this;
    }
    ret.asSingleCheck = function(){
      this._form._single_check = true;
      return this;
    }
    
    ret.withOption.nonMeta = true;
    ret.asSingleCheck.nonMeta = true;

    return ret;
  }
  Aj.form.singleCheck=function(){
    var ret = Aj.form.apply(Aj, arguments);
    ret._form._single_check = true;
    return ret;
  }

  /*
  Aj.form.optionText=function(optionData, targetField, convertFns){
    return null;
  }
  */

  Aj.form.optionText=function(optionData, searchValue, convertFns){
    if(!Array.isArray(optionData)){
      return undefined;
    }
    var valueArray;
    if(Array.isArray(searchValue)){
      valueArray = searchValue;
    }else{
      valueArray = [searchValue];
    }
    var searchValueFn, valueFn, textFn;
    if(convertFns){
      searchValueFn = convertFns._search;
      valueFn = convertFns._value;
      textFn = convertFns._text;
    }
    if(!valueFn){
      valueFn = function(v){
        if(v.value === undefined){
          return v;
        }else{
          return v.value;
        }
      };
    }
    if(!textFn){
      textFn = function(v){
        if(v.text === undefined){
          return v;
        }else{
          return v.text;
        }
      };
    }
    var resultArray = [];
    for(var i=0;i<valueArray.length;i++){
      var sv = valueArray[i];
      for(var j=0;j<optionData.length;j++){
        if(valueFn(optionData[j]) == sv){
          resultArray.push(textFn(optionData[j]));
          break;
        }
      }
      resultArray.push(undefined);
    }
    
    if(Array.isArray(searchValue)){
      return resultArray;
    }else{
      return resultArray[0];
    }
  }

  if(Aj.config.autoSyncAfterJqueryAjax){
    $( document ).ajaxComplete(function() {
      console.log("I am here");
      Aj.sync();
    });
  }

  Aj.delay=function(callback, timeout){
    setTimeout(function(){
      callback.apply();
      Aj.sync();
    }, timeout ? timeout : 0);
  }
  //export
  window.Aj = Aj;
})();