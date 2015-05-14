/**
 * Asta4js  * Released under the XXX License.
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Aj"] = factory();
	else
		root["Aj"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);
	var shallow = util.shallowCopy;

	var Aj={};

	//basic apis
	Aj.config = __webpack_require__(2);

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
	__webpack_require__(3);

	//internal extension
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);

	shallow(__webpack_require__(7), Aj);

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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var constant = __webpack_require__(8)

	var util = {};

	util.sync = function(){
	  Platform.performMicrotaskCheckpoint();
	};

	util.determineRefPath = function (scope, varRef, searchKey) {
	  var deleteSearchKey;
	  if(searchKey){
	    deleteSearchKey = false;
	  }else{
	    deleteSearchKey = true;
	    searchKey = constant.impossibleSearchKey;
	    varRef[searchKey] = 1;
	  }

	  var refPath = null;
	  for (var p in scope) {
	    var ref = scope[p];
	    if (ref[searchKey]) {
	      refPath = p;
	      break;
	    }
	  }
	  
	  if(deleteSearchKey){
	    delete varRef[searchKey];
	  }

	  return refPath;
	};

	var __uidTimestamp = Date.now();
	var __uidSeq = 0;
	util.createUID = function () {
	  if(__uidSeq >= 1000000){
	    __uidTimestamp = Date.now();
	    __uidSeq = 0;
	  }
	  __uidSeq++;
	  return "aj-" + __uidSeq + "-"+ __uidTimestamp;
	};

	//TODO we should keep ref always
	util.regulateArray = function (v, tryKeepRef) {
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
	};

	util.clone = __webpack_require__(9);

	/**
	 * (from)
	 * (from, [propList])
	 * (from, to)
	 * (from, to, [propList])
	 */
	util.shallowCopy = function(arg1, arg2, arg3){
	  var from = arg1;
	  var to;
	  var props;
	  if(Array.isArray(arg2)){
	    to = {};
	    props = arg2;
	  }else{
	    to = arg2;
	    props = arg3;
	  }
	  if(!to){
	    to = {};
	  }
	  if(props){
	    var p;
	    for(var i=0;i<props.length;i++){
	      p = props[i];
	      to[p] = from[p];
	    }
	  }else{
	    for(var p in from){
	      to[p] = from[p];
	    }
	  }
	  
	  return to;
	};

	util.arraySwap = function (array, index1, index2) {
	      var tmp = array[index1];
	      array[index1] = array[index2];
	      array[index2] = tmp;
	};

	util.arrayLengthAdjust = function (targetArray, hopeLength, initialNewFn, discardCutFn) {
	  var existingLength = targetArray.length;
	  if(initialNewFn){
	    var newItem;
	    for(var i=existingLength;i<hopeLength;i++){
	      newItem = initialNewFn(i);
	      targetArray[i] = newItem;
	    }
	  }else{
	    for(var i=existingLength;i<hopeLength;i++){
	      targetArray[i] = undefined;
	    }
	  }
	  var removeCount = existingLength - hopeLength;
	  if(removeCount > 0){
	    if(discardCutFn){
	      for(var i=hopeLength;i<existingLength;i++){
	        discardCutFn(targetArray[i], i);
	      }
	    }
	    targetArray.splice(hopeLength, removeCount);
	  }
	};
	    
	util.findWithRoot = function(rootElem, selector){
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
	};

	util.delay=function(callback, timeout, delayMoreCycles){
	  if(delayMoreCycles && delayMoreCycles > 0){
	    setTimeout(function(){
	      util.delay(callback, timeout, delayMoreCycles-1);
	    }, 0);
	    return;
	  }else{
	    setTimeout(function(){
	      callback.apply();
	      util.sync();
	    }, timeout ? timeout : 0);
	  }
	}

	module.exports = util;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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



/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var Snippet = __webpack_require__(10);
	var rewriteObserverMeta = __webpack_require__(11);

	var BindContext = __webpack_require__(12);
	var ValueMonitor = __webpack_require__(13);


	var Scope = function(){
	};

	var createValueMonitorContext=function(scope, varRef){

	  var refPath = util.determineRefPath(scope, varRef);
	  var monitor = new ValueMonitor(scope, refPath);
	  
	  return {
	    _valueMonitor: monitor
	  };

	}

	var createSnippetContext=function(snippet){
	  return {
	    _snippet: snippet
	  };
	}

	Scope.prototype.observe = function(varRef, meta){
	  var context = createValueMonitorContext(this, varRef);
	  var bindContext = new BindContext(context);
	  bindContext._bind(meta);
	}


	Scope.prototype.snippet = function(selector){
	  var scope = this;
	  var snippet = new Snippet(selector);
	  snippet.bind = function(varRef, meta){
	    var context = createValueMonitorContext(scope, varRef);
	    context = util.shallowCopy(createSnippetContext(snippet), context);
	    var bindContext = new BindContext(context);
	    bindContext._bind(meta);
	    return this;
	  };
	  return snippet;
	}

	config.scope.create=function(){
	  return new Scope();
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lib_observe = __webpack_require__(14);

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var constant = __webpack_require__(8)
	var Snippet = __webpack_require__(10);
	var BindContext = __webpack_require__(12);

	var ComposedBindContext=function(contexts){
	  this._contexts = contexts;
	}

	//extends from BindContext
	util.shallowCopy(BindContext.prototype, ComposedBindContext.prototype);

	ComposedBindContext.prototype._bind=function(meta){
	  for(var i=0;i<this._contexts.length;i++){
	    this._contexts[i]._bind(meta);
	  }
	}

	ComposedBindContext.prototype._discard=function(){
	  for(var i=0;i<this._contexts.length;i++){
	    this._contexts[i].discard();
	  }
	}

	var _duplicator = function(meta){
	  var duplicator = meta._duplicator;
	  var targetPath = meta._target_path;
	  if(!meta._array_map && !meta._array_discard){
	    meta._array_discard = function(){
	      var mappedArrayInfo = bindContext._getResource("_duplicator", duplicator);
	      if(!mappedArrayInfo){
	        //it seems that we do not need to remove all the existing DOMs
	      }
	      bindContext._removeResource("_duplicator", duplicator);
	    };
	    
	    meta._array_child_context_creator = function(parentContext, contextOverride, index, itemMeta){
	      var mappedArrayInfo = parentContext._getResource("_duplicator", duplicator);//must have
	      var item = mappedArrayInfo.items[index];
	      var childContexts = [];
	      var context;
	      for(var i=0;i<item.length;i++){
	        context = {
	          _snippet: new Snippet(item[i])
	        };
	        util.shallowCopy(contextOverride, context);
	        context = parentContext._createChildContext(this._item._meta_trace_id, index, context);
	        childContexts[i] = context;
	      }
	      var composedContext = new ComposedBindContext(childContexts);
	      return composedContext;
	    }
	    
	    meta._array_discard = function(){
	      var mappedArrayInfo = bindContext._getResource("_duplicator", duplicator);
	      if(!mappedArrayInfo){
	        //it seems that we do not need to remove all the existing DOMs
	      }
	      bindContext._removeResource("_duplicator", duplicator);
	    };
	    meta._array_map = function(newValue, oldValue, bindContext){
	      var mappedArrayInfo = bindContext._getResource("_duplicator", duplicator);
	      if(!mappedArrayInfo){
	        mappedArrayInfo = {
	          discard: function(){},
	          dupTargets: [],
	          items: []//[][]
	        };
	        bindContext._addResource("_duplicator", duplicator, mappedArrayInfo);

	        //initialize the place holder and template
	        var snippet = bindContext._snippet;
	        var targets = snippet.find(duplicator);
	        for(var i=0;i<targets.length;i++){
	          var elem = targets.get(i);
	          var tagName = elem.tagName;
	          var placeHolderId = util.createUID();
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
	          
	          mappedArrayInfo.dupTargets[i] = {
	            placeHolder: placeHolder,
	            insertPoint: placeHolder,
	            templateStr: templateStr
	          };
	        }
	      }
	      
	      var existingLength = mappedArrayInfo.items.length;
	      var regularNew = util.regulateArray(newValue);
	      var targetLength = mappedArrayInfo.dupTargets.length;
	      
	      util.arrayLengthAdjust(mappedArrayInfo.items, regularNew.length, function(){
	        var mappedItem = [];
	        var dupTarget;
	        var dupSpawned;
	        for(var j=0;j<targetLength;j++){
	          dupTarget = mappedArrayInfo.dupTargets[j];
	          dupSpawned = $(dupTarget.templateStr);
	          dupTarget.insertPoint.after(dupSpawned);
	          dupTarget.insertPoint = dupSpawned;
	          mappedItem[j] = dupSpawned;
	        }
	        return mappedItem;
	      }, function(mappedItem){
	        for(var j=0;j<targetLength;j++){
	          mappedItem[j].remove();
	        }
	      });

	      //reset insert point
	      var lastItem = mappedArrayInfo.items[regularNew.length-1];
	      var dupTarget;
	      for(var j=0;j<targetLength;j++){
	        dupTarget = mappedArrayInfo.dupTargets[j];
	        dupTarget.insertPoint = lastItem ? lastItem[j] : dupTarget.placeHolder;
	      }
	      
	      return mappedArrayInfo.items;
	    };
	  }
	};//end _duplicator

	var _selector = function (meta) {
	  //rewrite selector to extract attr operations
	  var attrOpIndex = meta._selector.indexOf("@>");
	  if (attrOpIndex >= 0) {
	    meta._attr_op = meta._selector.substr(attrOpIndex + 2);
	    meta._selector = meta._selector.substring(0, attrOpIndex);
	  }
	  meta._selector_after_attr_op = meta._selector;
	};

	var _attr_op = function (meta){
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
	    for (var i = 0; i < attrRegs.length; i++) {
	      var attrReg = attrRegs[i];
	      var matchResult = attrReg.reg.exec(attrOp);
	      if (matchResult) {
	        var matched = matchResult[1];
	        renderFn = attrReg.renderFn(matched);
	        break;
	      }
	    }

	    if (renderFn) {
	      meta._render = renderFn;
	    } else {
	      throw "not supported attr operation:" + attrOp;
	    }
	  }
	}; // end _attr_op

	var _selector_after_attr_op = function (meta) {
	  if (!meta._render) {
	    meta._render = function (target, newValue, oldValue, bindContext) {
	      if(newValue === null || newValue === undefined){
	        newValue = "";
	      }
	      target.text(newValue);
	    };
	  }
	  
	  //revive _selector because we will need it later
	  meta._selector = meta._selector_after_attr_op;
	};
	      
	var _render = function (meta) {
	  if(!meta._change_handler_creator){
	    var renderFn = meta._render;
	    var selector = meta._selector;
	    var targetPath = meta._target_path;
	    meta._change_handler_creator = function(bindContext){
	      var snippet = bindContext._snippet;
	      var target = snippet.find(selector);
	      if(targetPath === "_index"){
	        //we do not need to observe anything, just return a force render handler
	        return function(){
	          renderFn(target, bindContext._arrayIndexes[bindContext._arrayIndexes.length - 1], undefined, bindContext);
	        }
	      }else if (targetPath == "_indexes"){
	        //we do not need to observe anything, just return a force render handler
	        return function(){
	          renderFn(target, bindContext._arrayIndexes, undefined, bindContext);
	        }
	      }else{
	        return function(newValue, oldValue, bindContext){
	          //TODO we should convert old value too.
	          renderFn(target, newValue, oldValue, bindContext);
	        }
	      }
	    }
	  }
	};

	var _register_dom_change = function (meta) {
	  if (!meta._register_assign) {
	    var _register_dom_change = meta._register_dom_change;
	    var selector = meta._selector;
	    meta._register_assign = function(bindContext, changeHandler){
	      var snippet = bindContext._snippet;
	      var target = snippet.find(selector);
	      return _register_dom_change(target, changeHandler, bindContext);
	    }
	  }
	}

	config.meta.rewritterMap["_duplicator"] = {
	  priority : constant.metaRewritterPriority["_duplicator"],
	  fn : _duplicator
	};

	config.meta.rewritterMap["_selector"] = {
	  priority : constant.metaRewritterPriority["_selector"],
	  fn : _selector
	};

	config.meta.rewritterMap["_attr_op"] = {
	  priority : constant.metaRewritterPriority["_attr_op"],
	  fn : _attr_op
	};

	config.meta.rewritterMap["_selector_after_attr_op"] = {
	  priority : constant.metaRewritterPriority["_selector_after_attr_op"],
	  fn : _selector_after_attr_op
	};

	config.meta.rewritterMap["_render"] = {
	  priority : constant.metaRewritterPriority["_render"],
	  fn : _render
	};

	config.meta.rewritterMap["_register_dom_change"] = {
	  priority : constant.metaRewritterPriority["_register_dom_change"],
	  fn : _register_dom_change
	};




/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lib_observe = __webpack_require__(14);

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var constant = __webpack_require__(8)
	var ValueMonitor = __webpack_require__(13)

	var getWatchDelegateScope=function(bindContext, meta){
	  var watchDelegateScope = bindContext._getResource("_watch", meta._meta_trace_id);
	  if(!watchDelegateScope){
	    watchDelegateScope = {
	      value: undefined,
	    };
	    var valueMonitor = new ValueMonitor(watchDelegateScope, "");
	    watchDelegateScope.valueMonitor = valueMonitor;
	    watchDelegateScope.valueRef = valueMonitor.getValueRef("value");
	    watchDelegateScope.discard=function(){
	      this.valueMonitor.discard();
	    }
	    bindContext._addResource("_watch", meta._meta_trace_id, watchDelegateScope);
	  }
	  return watchDelegateScope;
	}

	var _watch = function (meta) {
	  var watchDef = meta._watch;
	  var parentPath = meta._target_path;
	  var dotIdx = parentPath.lastIndexOf(".");
	  if(dotIdx >= 0){
	    parentPath = parentPath.substring(0, dotIdx);
	  }else{
	    parentPath = "";
	  }
	  
	  var observerTargets = watchDef._fields.map(function(f){
	    var path;
	    if(f.indexOf("@:") == 0){
	      path = f;
	    }else{
	      if(parentPath){
	        path = parentPath + "." + f;
	      }else{
	        path = f;
	      }
	    }
	    return path;
	  });
	  
	  if (!meta._register_on_change) {
	    meta._register_on_change = function(bindContext, changeHandler) {
	      var watchDelegateScope = getWatchDelegateScope(bindContext, meta);
	      watchDelegateScope.valueMonitor.pathObserve(meta._meta_trace_id, "value", function(newValue, oldValue){
	        changeHandler(newValue, oldValue, bindContext);
	      });
	      return function(){
	        changeHandler(watchDelegateScope.valueRef.getValue(), undefined, bindContext);
	      }
	    };
	  }
	  
	  if(!meta._assign){
	    meta._assign = function (value, bindContext){
	      var watchDelegateScope = getWatchDelegateScope(bindContext, meta);
	      watchDelegateScope.valueRef.setValue(value);
	      if(watchDef._store){
	        bindContext._valueMonitor.getValueRef(meta._target_path).setValue(value);
	      }
	    };
	  }
	  
	  if(!meta._register_assign){
	    meta._register_assign = function (bindContext, changeHandler){
	      var watchDelegateScope = getWatchDelegateScope(bindContext, meta);
	      bindContext._valueMonitor.compoundObserve(meta._meta_trace_id, observerTargets, function(newValues, oldValues){
	        if(watchDef._cal){
	          changeHandler(watchDef._cal.apply(null, newValues), bindContext);
	        }else{
	          changeHandler(newValues, bindContext);
	        }
	      });
	      var valueRef = bindContext._valueMonitor.getCompoundValueRef(observerTargets);
	      var force = function(){
	        var targetValues = valueRef.getValues();
	        var value;
	        if(watchDef._cal){
	          value = watchDef._cal.apply(null, targetValues);
	        }else{
	          value = targetValues;
	        }
	        changeHandler(value, bindContext);
	      };
	      force.apply();
	      return force;
	    }
	  }
	};

	config.meta.rewritterMap["_watch"] = {
	  priority : constant.metaRewritterPriority["_watch"],
	  fn : _watch
	};




/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lib_observe = __webpack_require__(14);

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var constant = __webpack_require__(8)
	var Snippet = __webpack_require__(10)

	var BindContext = __webpack_require__(12)
	var ValueMonitor = __webpack_require__(13)

	var optionUtil = __webpack_require__(15)

	var getInputType=function(jq){
	  var inputType;
	  var tagName = jq.prop("tagName");
	  if(tagName === "INPUT"){
	    inputType = jq.attr("type");
	    if(inputType){
	      inputType = inputType.toLowerCase();
	    }
	  }else if(tagName === "SELECT"){
	    inputType = "select";
	  }
	  return inputType;
	}

	var combinedChangeEvents = function(formDef, inputType){
	  var changeEvents = new Array();

	  var defaultChangeEvent = formDef._default_change_event;
	  if (defaultChangeEvent === undefined) {
	    if(inputType === "checkbox" || inputType === "radio"){
	      changeEvents.push("click");
	    }else{
	      changeEvents.push("change");
	    }
	  } else if (defaultChangeEvent) {
	    changeEvents.push(defaultChangeEvent);
	  }

	  var extraChangeEvents = formDef._extra_change_events;
	  extraChangeEvents = util.regulateArray(extraChangeEvents);
	  Array.prototype.push.apply(changeEvents, extraChangeEvents);
	  return changeEvents;
	}

	var defaultFormRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
	  if(target.val() != newValue){
	    target.val(newValue);
	  }
	}

	var defaultFormRegisterDomChange = function(meta, formDef, inputType, target, changeHandler, bindContext){
	  target.bind(combinedChangeEvents(formDef, inputType).join(" "), function () {
	    var v = $(this).val();
	    changeHandler(v, bindContext);
	  });
	}

	var selectRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
	  //move diverge value option at first
	  target.find("[aj-diverge-value]").remove();
	  
	  var va = util.regulateArray(newValue);
	  if(!target.prop("multiple") && va.length == 0){
	    //single select with 0 length value array means we have a undefined/null/empty value
	    va[0] = "";
	  }
	  var unmatchedValue = [];
	  var v;
	  for(var i=0;i<va.length;i++){
	    v = va[i];
	    if(v === null || v === undefined){
	      v = "";
	    }
	    var foundOption = target.find("option[value='"+v+"']");
	    if(foundOption.length === 0){
	      unmatchedValue.push(v);
	    }else{
	      foundOption.prop("selected", true);
	    }
	  }
	  if(unmatchedValue.length > 0){
	    for(var i=0;i<unmatchedValue.length;i++){
	      var op = $("<option aj-diverge-value selected>").val(newValue).text(newValue);
	      target.prepend(op);
	    }
	  }
	}


	var selectRegisterDomChange = function(meta, formDef, inputType, target, changeHandler, bindContext){
	    //just for register option binding info
	    
	    var optionSnippet = new Snippet(target);
	    bindContext._addDiscardHook(function(){
	      optionSnippet._discard();
	    });
	    
	    var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
	    optionBindingHub.optionSnippet = optionSnippet;

	    defaultFormRegisterDomChange(meta, formDef, inputType, target, changeHandler, bindContext);
	}


	var checkboxOrRadioRender = function(meta, formDef, inputType, target, newValue, oldValue, bindContext){
	  if(formDef._single_check){
	    if(newValue){
	      target.prop("checked", true);
	    }else{
	      target.prop("checked", false);
	    }
	  }else{
	    var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
	    var va = util.regulateArray(newValue);
	    if(inputType === "radio" && va.length > 1){
	      throw "There are over than one candidate value for radio:" + va;
	    }
	    var unmatchedValue = [];
	    var optionId = optionBindingHub.optionId;
	    
	    if(!optionId){//option bind has not been called yet
	      return;
	    }
	    
	    var snippet = bindContext._snippet;
	    
	    //remove the auto generated diverge elements
	    snippet.find("[aj-diverge-value=" + optionId + "]").remove();
	    
	    //find out all the existing options
	    var ops = snippet.find("[aj-option-binding=" + optionId + "]");
	    //set all to false at first
	    util.findWithRoot(ops, "input[type="+inputType+"]").prop("checked", false);
	    va.forEach(function(v){
	      if(v === null || v === undefined){
	        v = "";
	      }
	      var foundInput = util.findWithRoot(ops, "input[value='"+v+"']");
	      if(foundInput.length === 0){
	        if(v){
	          unmatchedValue.push(v);
	        }
	      }else{
	        foundInput.prop("checked", true);
	      }
	    });
	    if(unmatchedValue.length > 0){
	      //there must be "aj-placeholder-id"
	      var placeHolderId = target.attr("aj-placeholder-id");
	      var insertPoint = snippet.find("#" + placeHolderId);
	      unmatchedValue.forEach(function(v){
	        var uid = util.createUID();
	        var input = target.clone().attr("id", uid).val(v).prop("checked", true);
	        var label = $("<label>").attr("for",uid).text(v);
	        
	        var diverge = $("<span>").attr("aj-diverge-value", optionId);
	        diverge.append(input).append(label);
	        
	        insertPoint.after(diverge);
	      });
	    }
	  }
	}

	var checkboxOrRadioRegisterDomChange = function(meta,formDef, inputType, target, changeHandler, bindContext){
	  var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
	  var changeEvents = combinedChangeEvents(formDef, inputType);
	  if(formDef._single_check){
	    target.bind(changeEvents.join(" "), function () {
	      var v = $(this).prop("checked");
	      changeHandler(v, bindContext);
	    }); 
	  }else{
	    optionBindingHub.optionId = util.createUID();
	    optionBindingHub.targetValueRef = bindContext._valueMonitor.getValueRef(meta._target_path);
	    optionBindingHub.changeEvents = changeEvents;
	  }
	}

	var findTypedHandler=function(handlerMap, inputType){
	  var fn = handlerMap[inputType];
	  if(fn){
	    return fn;
	  }else{
	    return handlerMap["__default__"];//must have
	  }
	}

	var optionMetaCache = {};

	var _form = function (meta) {
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
	  
	  // init option bind hub
	  /*
	  meta._pre_binding.push(function(bindContext){
	    
	  });
	  */

	  if (!meta._render) {
	    meta._render = function (target, newValue, oldValue, bindContext) {
	      var inputType = getInputType(target);
	      var handler = findTypedHandler(config.meta.typedFormHandler._render, inputType);
	      handler(meta, formDef, inputType, target, newValue, oldValue, bindContext);
	    };
	  } 

	  if (!meta._register_dom_change) {
	    meta._register_dom_change = function (target, changeHandler, bindContext) {
	      var inputType = getInputType(target);
	      var handler = findTypedHandler(config.meta.typedFormHandler._register_dom_change, inputType);
	      
	      var optionBindingHub;
	      if(inputType && !formDef._single_check){
	        optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);
	        optionBindingHub.inputType = inputType;
	      }
	      
	      handler(meta, formDef, inputType, target, changeHandler, bindContext);
	    }
	  }
	  
	  if (formDef._option) {
	    var varPath = formDef._option._var_path;
	    var varRef = formDef._option._var_ref;
	    var varRefSearchKey = formDef._option._var_ref_search_key;
	    delete formDef._option._var_path;
	    delete formDef._option._var_ref;
	    delete formDef._option._var_ref_search_key;
	    optionMetaCache[meta._meta_trace_id] = {
	      varPath: varPath,
	      varRef: varRef,
	      varRefSearchKey: varRefSearchKey,
	      optionMeta: undefined
	    };
	    meta._post_binding.push(function (bindContext) {
	      var scope = bindContext._valueMonitor.scope;
	      var optionBindingHub = optionUtil.getOptionBindingHub(bindContext, meta._meta_trace_id);//must have
	      
	      var cachedOptionMetaInfo = optionMetaCache[meta._meta_trace_id];
	      var varPath = cachedOptionMetaInfo.varPath;
	      var optionMeta = cachedOptionMetaInfo.optionMeta;

	      if(!varPath){
	        varPath = util.determineRefPath(scope, cachedOptionMetaInfo.varRef, cachedOptionMetaInfo.varRefSearchKey);
	        cachedOptionMetaInfo.varPath = varPath;
	        
	        delete varRef[varRefSearchKey];
	        delete scope[varPath][varRefSearchKey];
	        delete cachedOptionMetaInfo.varRef;
	        delete cachedOptionMetaInfo.varRefSearchKey;
	      }
	      
	      if(!optionMeta){
	        optionMeta = optionUtil.rewriteOptionMeta(formDef._option, optionBindingHub.inputType);
	        cachedOptionMetaInfo.optionMeta = optionMeta;
	      }
	      
	      optionBindingHub.notifyOptionChanged=function(){
	        bindContext._forceSyncFromObserveTarget(meta._meta_trace_id);
	      };

	      var optionMonitor = new ValueMonitor(scope, varPath);
	      var snippet = optionBindingHub.optionSnippet ? optionBindingHub.optionSnippet : bindContext._snippet;
	      
	      var optionContext = new BindContext({
	        _valueMonitor: optionMonitor,
	        _snippet: snippet,
	        _optionBindingHub: optionBindingHub,
	        _inputTargetBindContext: bindContext,
	      });
	      bindContext._addDiscardHook(function(){
	        optionContext._discard();
	      });
	      optionContext._bind(optionMeta);
	    });
	  }
	}

	config.meta.rewritterMap["_form"] = {
	  priority : constant.metaRewritterPriority["_form"],
	  fn : _form
	};

	config.meta.typedFormHandler._render["__default__"] = defaultFormRender;
	config.meta.typedFormHandler._render["select"] = selectRender;
	config.meta.typedFormHandler._render["checkbox"] = checkboxOrRadioRender;
	config.meta.typedFormHandler._render["radio"] = checkboxOrRadioRender;

	config.meta.typedFormHandler._register_dom_change["__default__"] = defaultFormRegisterDomChange;
	config.meta.typedFormHandler._register_dom_change["select"] = selectRegisterDomChange;
	config.meta.typedFormHandler._register_dom_change["checkbox"] = checkboxOrRadioRegisterDomChange;
	config.meta.typedFormHandler._register_dom_change["radio"] = checkboxOrRadioRegisterDomChange;



/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lib_observe = __webpack_require__(14);

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var constant = __webpack_require__(8)
	var Snippet = __webpack_require__(10)

	var api={};

	/**
	 * _varRef : binding reference
	 * _meta   : option meta or target binding property name
	 * _meta2  : _duplicator
	 */
	api.optionBind = function (_varRef, _meta, _meta2) {
	  var meta;
	  if (typeof _meta === "string") {
	    meta = {};
	    meta[_meta] = {};
	  } else {
	    meta = util.clone(_meta);
	  }
	  
	  if(typeof _meta2 === "string"){
	    for(var kk in meta){
	      meta[kk]._duplicator = _meta2;
	    }
	  }
	  
	  var searchKey = constant.impossibleSearchKey + "-option-bind-trick-" + util.createUID();
	  _varRef[searchKey] = 1;
	  
	  meta._var_ref = _varRef;
	  meta._var_ref_search_key = searchKey;
	  
	  return meta;
	}, //end optionBind

	/**
	 * [target]: string->name or selector. object->{_name: ""} or {_selector: ""}
	 * [event1]: string->default change event array->extra change events
	 * [event2]: array->extra change events
	 */
	api.form = function(target, event1, event2){
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
	  if(event1){
	    if(typeof event1 === "string"){
	      defaultChangeEvent = event1;
	      extraChangeEvents = event2;
	    }else if (Array.isArray(event1)){
	      extraChangeEvents = event2;
	    }
	  }else{
	    //the client may call me as ({}, null, ["xxx"]), so the event1 is null but event2 exists
	    if(event2){
	      extraChangeEvents = event2;
	    }
	  }

	  
	  if(defaultChangeEvent){
	    ret._form._default_change_event = defaultChangeEvent;
	  }
	  ret._form._extra_change_events = extraChangeEvents;
	  
	  ret.withOption = function(){
	    this._form._option = api.optionBind.apply(Aj, arguments);
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
	api.form.singleCheck=function(){
	  var ret = api.form.apply(this, arguments);
	  ret._form._single_check = true;
	  return ret;
	}

	/*
	form.optionText=function(optionData, targetField, convertFns){
	  return null;
	}
	*/

	api.form.optionText=function(optionData, searchValue, convertFns){
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

	module.exports=api;




/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var constant={};

	constant.metaRewritterPriority={
	  _watch: 10000,
	  _form : 20000,
	  _duplicator: 30000,
	  _selector : 40000,
	  _attr_op : 50000,
	  _selector_after_attr_op : 60000,
	  _render : 70000,
	  _register_dom_change: 80000,
	  _on_change: 90000,
	  _assign : 100000
	};

	constant.impossibleSearchKey = "aj-impossible-search-key-ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";


	module.exports = constant;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer, module) {'use strict';

	var clone = (function(global) {

	/**
	 * Clones (copies) an Object using deep copying.
	 *
	 * This function supports circular references by default, but if you are certain
	 * there are no circular references in your object, you can save some CPU time
	 * by calling clone(obj, false).
	 *
	 * Caution: if `circular` is false and `parent` contains circular references,
	 * your program may enter an infinite loop and crash.
	 *
	 * @param `parent` - the object to be cloned
	 * @param `circular` - set to true if the object to be cloned may contain
	 *    circular references. (optional - true by default)
	 * @param `depth` - set to a number if the object is only to be cloned to
	 *    a particular depth. (optional - defaults to Infinity)
	 * @param `prototype` - sets the prototype to be used when cloning an object.
	 *    (optional - defaults to parent prototype).
	*/

	function clone(parent, circular, depth, prototype) {
	  var filter;
	  if (typeof circular === 'object') {
	    depth = circular.depth;
	    prototype = circular.prototype;
	    filter = circular.filter;
	    circular = circular.circular
	  }
	  // maintain two arrays for circular references, where corresponding parents
	  // and children have the same index
	  var allParents = [];
	  var allChildren = [];

	  var useBuffer = typeof Buffer != 'undefined';

	  if (typeof circular == 'undefined')
	    circular = true;

	  if (typeof depth == 'undefined')
	    depth = Infinity;

	  // recurse this function so we don't reset allParents and allChildren
	  function _clone(parent, depth) {
	    // cloning null always returns null
	    if (parent === null)
	      return null;

	    if (depth == 0)
	      return parent;

	    var child;
	    var proto;
	    if (typeof parent != 'object') {
	      return parent;
	    }

	    if (isArray(parent)) {
	      child = [];
	    } else if (isRegExp(parent)) {
	      child = new RegExp(parent.source, getRegExpFlags(parent));
	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
	    } else if (isDate(parent)) {
	      child = new Date(parent.getTime());
	    } else if (useBuffer && Buffer.isBuffer(parent)) {
	      child = new Buffer(parent.length);
	      parent.copy(child);
	      return child;
	    } else {
	      if (typeof prototype == 'undefined') {
	        proto = Object.getPrototypeOf(parent);
	        child = Object.create(proto);
	      }
	      else {
	        child = Object.create(prototype);
	        proto = prototype;
	      }
	    }

	    if (circular) {
	      var index = allParents.indexOf(parent);

	      if (index != -1) {
	        return allChildren[index];
	      }
	      allParents.push(parent);
	      allChildren.push(child);
	    }

	    for (var i in parent) {
	      var attrs;
	      if (proto) {
	        attrs = Object.getOwnPropertyDescriptor(proto, i);
	      }
	      
	      if (attrs && attrs.set == null) {
	        continue;
	      }
	      child[i] = _clone(parent[i], depth - 1);
	    }

	    return child;
	  }

	  return _clone(parent, depth);
	}

	/**
	 * Simple flat clone using prototype, accepts only objects, usefull for property
	 * override on FLAT configuration object (no nested props).
	 *
	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
	 * works.
	 */
	clone.clonePrototype = function(parent) {
	  if (parent === null)
	    return null;

	  var c = function () {};
	  c.prototype = parent;
	  return new c();
	};

	function getRegExpFlags(re) {
	  var flags = '';
	  re.global && (flags += 'g');
	  re.ignoreCase && (flags += 'i');
	  re.multiline && (flags += 'm');
	  return flags;
	}

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	function isDate(o) {
	  return typeof o === 'object' && objectToString(o) === '[object Date]';
	}

	function isArray(o) {
	  return typeof o === 'object' && objectToString(o) === '[object Array]';
	}

	function isRegExp(o) {
	  return typeof o === 'object' && objectToString(o) === '[object RegExp]';
	}

	if (global.TESTING) {
	  clone.getRegExpFlags = getRegExpFlags;
	  clone.objectToString = objectToString;
	  clone.isDate   = isDate;
	  clone.isArray  = isArray;
	  clone.isRegExp = isRegExp;
	}

	return clone;

	})( typeof(global) === 'object' ? global :
	    typeof(window) === 'object' ? window : this);

	if (module && module.exports)
	  module.exports = clone;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(17).Buffer, __webpack_require__(18)(module)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);
	var BindContext = __webpack_require__(12);
	var ValueMonitor = __webpack_require__(13);

	var Snippet = function(arg){
	  if (typeof arg === "string"){
	    this._root = $(arg);//as selector
	  }else{
	    this._root = arg;
	  }
	  if(this._root.length == 0){
	    var err = new Error("Snippet was not found for given selector:" + this.root.selector);
	    console.error(err);
	  }
	}

	Snippet.prototype._discard = function(){
	  this._root.remove();
	}

	Snippet.prototype.find = function(selector){
	  return util.findWithRoot(this._root, selector);
	}

	Snippet.prototype.on = function (event, selector, fn) {
	  this._root.on(event, selector, function(){
	    fn.apply(this, arguments);
	    util.sync();
	  });
	  return this;
	}

	module.exports = Snippet;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lib_observe = __webpack_require__(14);

	var util=__webpack_require__(1);
	var config=__webpack_require__(2);
	var constant = __webpack_require__(8)

	var __reverseMetaKeys = ["_meta_type", "_meta_id", "_meta_trace_id", "_meta_desc", "_value", "_prop", "_splice", "_target_path"];

	var __ordered_metaRewritter = null;

	var getOrderedMetaRewritter = function(){
	  if(__ordered_metaRewritter){
	    return __ordered_metaRewritter;
	  }
	  
	  var array = new Array();
	  for (var k in config.meta.rewritterMap) {
	    var def = config.meta.rewritterMap[k];
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

	var initBindingHookArray = function(meta, hookName){
	  if(meta[hookName]){
	    if(Array.isArray(meta[hookName])){
	      meta[hookName] = [].concat(meta[hookName]);
	    }else{
	      throw hookName + " must be array but we got:" + JSON.stringify(meta);
	    }
	  }else{
	    meta[hookName] = [];
	  }
	}

	var normalizeMeta = function(meta, metaId, propertyPath){
	  
	  if(propertyPath === undefined || propertyPath === null){
	    propertyPath = "";
	  }
	  
	  if(Array.isArray(meta)){
	    return meta.map(function(m){
	      return normalizeMeta(m, metaId, propertyPath);
	    });
	  }
	  
	  
	  var newMeta = util.clone(meta);
	  
	   //convert function to standard meta format
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
	        newMeta[subMetak] = normalizeMeta(subMeta, newMeta._meta_id, propertyPath);
	      }
	    break;
	    case "_splice":
	    case "_value":
	      //now we will call the registered meta rewritter to rewrite the meta
	      
	      if(newMeta._meta_type === "_value"){
	        //array binding
	        var itemMeta = newMeta._item;
	        if(itemMeta){
	          newMeta._item = normalizeMeta(itemMeta, newMeta._meta_id, "");
	        }
	      }
	      
	      //binding hooks
	      initBindingHookArray(newMeta, "_pre_binding");
	      initBindingHookArray(newMeta, "_post_binding");

	      //rewrite meta
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
	          var targetPath = newMeta._target_path;
	          newMeta._register_on_change = function (bindContext, changeHandler) {
	            bindContext._valueMonitor.pathObserve(newMeta._meta_trace_id, targetPath, function(newValue, oldValue){
	              changeHandler(newValue, oldValue, bindContext);
	            });
	            var vr = bindContext._valueMonitor.getValueRef(targetPath);
	            return function(){
	              changeHandler(vr.getValue(), undefined, bindContext);
	            };
	          };
	          if(newMeta._item){
	            var changeHandlerCreator = newMeta._change_handler_creator;
	            var itemMeta = newMeta._item;
	            var arrayMap = newMeta._array_map;
	            var arrayDiscard = newMeta._array_discard;
	            /*
	            if(!arrayMap){
	              throw "_array_map and _array_discard is necessary for _item mapping but we got:" + JSON.stringify(newMeta);
	            }
	            */
	            var arrayChildContextCreator = newMeta._array_child_context_creator;
	            if(!arrayChildContextCreator){
	              arrayChildContextCreator = function(parentContext, contextOverride, index){
	                var childContext = parentContext._createChildContext(this._item._meta_trace_id, index, contextOverride);
	                return childContext;
	              };
	              //may not be necessary, but...
	              newMeta._array_child_context_creator = arrayChildContextCreator;
	            }
	            newMeta._change_handler_creator = function(bindContext){
	              var existingChangeFn = changeHandlerCreator ? changeHandlerCreator.call(this, bindContext) : undefined;
	              //we have to discard the mapped array before current context is discarded.
	              if(arrayDiscard){
	                bindContext._addDiscardHook(function(){
	                  arrayDiscard.apply(newMeta);
	                });
	              }
	              return function(newValue, oldValue, bindContext){
	                if(existingChangeFn){
	                  existingChangeFn.call(this, arguments);
	                }
	                
	                //register spice at first
	                if(newValue){
	                  bindContext._valueMonitor.arrayObserve(newMeta._meta_trace_id, newValue, function(splices){
	                    
	                     //retrieve mapped array for item monitor
	                    var mappedArray = arrayMap ? arrayMap.call(newMeta, newValue, newValue, bindContext) : newValue;
	                    if(!mappedArray && newValue){
	                      throw "Did you forget to return the mapped array from _array_map of: " + JSON.stringify(newMeta);
	                    }
	                    var addedCount = 0;
	                    var removedCount = 0;

	                    splices.forEach(function (s) {
	                      removedCount += s.removed.length;
	                      addedCount += s.addedCount;
	                    });

	                    var diff = addedCount - removedCount;
	                    var newLength = newValue.length;
	                    if(diff > 0){
	                      var childContext;
	                      var newRootMonitorPath;
	                      for (var i = diff; i >0; i--) {
	                        newRootMonitorPath = targetPath + "[" + (newLength - i) +"]";
	                        newMonitor = bindContext._valueMonitor.createSubMonitor(newRootMonitorPath);
	                        var childContext = {
	                          _valueMonitor: newMonitor,
	                          _mappedItem: mappedArray[i] //must be not null
	                        };
	                        childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, newLength - i);
	                        childContext._bind(itemMeta);
	                      }
	                    }else{
	                      diff = 0 - diff;
	                      for(var i=0;i<diff;i++){
	                        bindContext._removeChildContext(itemMeta._meta_trace_id, newLength + i);
	                      }
	                    }
	                  });
	                }else if(oldValue){//which means we need to remove previous registered array observer
	                  bindContext._valueMonitor.removeArrayObserve(newMeta._meta_trace_id);
	                }
	                
	                //retrieve mapped array for item monitor
	                var mappedArray = arrayMap ? arrayMap.call(newMeta, newValue, oldValue, bindContext): newValue;
	                if(!mappedArray && newValue){
	                  throw "Did you forget to return the mapped array from _array_map of: " + JSON.stringify(newMeta);
	                }
	                
	                //bind item context
	                var regularOld = util.regulateArray(oldValue);
	                var regularNew = util.regulateArray(newValue);
	                var childContext;
	                var newRootMonitorPath;
	                var newMonitor;
	                //add new child context binding
	                for(var i=regularOld.length;i<regularNew.length;i++){
	                  newRootMonitorPath = targetPath + "[" + i +"]";
	                  newMonitor = bindContext._valueMonitor.createSubMonitor(newRootMonitorPath);
	                  var childContext = {
	                    _valueMonitor: newMonitor,
	                    _mappedItem: mappedArray[i] //must be not null
	                  };
	                  childContext = arrayChildContextCreator.call(newMeta, bindContext, childContext, i);
	                  childContext._bind(itemMeta);
	                }
	                for(var i=regularNew.length;i<regularOld.length;i++){
	                  bindContext._removeChildContext(itemMeta._meta_trace_id, i);
	                }
	              };//returned change handler
	            };
	          }//_item
	          
	          if(newMeta._meta_type == "_splice"){
	            var spliceChangeHandlerCreator = newMeta._change_handler_creator;
	            newMeta._change_handler_creator = function(bindContext){
	              var spliceFn = spliceChangeHandlerCreator.call(this, bindContext);
	              return function(newValue, oldValue, bindContext){
	                if(newValue){
	                  bindContext._valueMonitor.arrayObserve(newMeta._meta_trace_id, newValue, spliceFn);
	                }else if(oldValue){//which means we need to remove previous registered array observer
	                  bindContext._valueMonitor.removeArrayObserve(newMeta._meta_trace_id);
	                }
	              }
	            }
	          }//_splice
	        }
	      }
	      //set default assign even we do not need it
	      if(!newMeta._assign_change_handler_creator){
	        var targetPath = newMeta._target_path;
	        newMeta._assign_change_handler_creator = function(bindContext){
	          var vr = bindContext._valueMonitor.getValueRef(targetPath)
	          return function(value, bindContext){
	            vr.setValue(value);
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
	        if(p === "_index" || p === "_indexes"){
	          newMeta[p] = normalizeMeta(ppm, newMeta._meta_id, p);
	        }else{
	          var recursivePath;
	          if(propertyPath){
	            recursivePath = propertyPath + "." + p;
	          }else{
	            recursivePath = p;
	          }
	          newMeta[p] = normalizeMeta(ppm, newMeta._meta_id, recursivePath);
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
	  //if _assign is specified, the _assign_change_handler_creator will be forced to handle _assign
	  meta._assign_change_handler_creator = function(bindContext){
	    return function(value, bindContext){
	      changeFn(value, bindContext);
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
	  if (fieldName === "_index"){
	    return "_prop";
	  } else if (fieldName === "_indexes") {
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

	module.exports = normalizeMeta

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var normalizeMeta = __webpack_require__(11);

	var ResourceMap = __webpack_require__(16);

	var BindContext=function(override, arrayIndexes){
	  if(override){
	    util.shallowCopy(override, this);
	  }

	  this._arrayIndexes = arrayIndexes;
	  this._resourceMap = new ResourceMap();
	  //we declared an independent map for child context due to performance reason
	  this._childContextMap = new ResourceMap();
	  
	  this._discardHook = [];
	  
	  this._forceSyncFromObserveTargetMap={};
	  this._forceSyncToObserveTargetMap={};  

	}

	BindContext.prototype._getArrayIndexes=function(){
	  return this._arrayIndexes;
	}

	BindContext.prototype._getArrayIndex=function(){
	  return this._arrayIndexes[this._arrayIndexes.length-1];
	}

	BindContext.prototype._addResource=function(category, identifier, discardable){
	  this._resourceMap.add(category, identifier, discardable);
	}

	BindContext.prototype._removeResource=function(category, identifier){
	  this._resourceMap.remove(category, identifier);
	}

	BindContext.prototype._getResource=function(category, identifier){
	  return this._resourceMap.get(category, identifier);
	}

	BindContext.prototype._createChildContext=function(identifier, index, override){
	  var indexes = this._arrayIndexes ? util.clone(this._arrayIndexes) : [];
	  indexes.push(index);
	  var ov = util.shallowCopy(this);
	  util.shallowCopy(override, ov);
	  var context = new BindContext(ov, indexes);
	  this._childContextMap.add(index, identifier, context);
	  context._parentContext = this;
	  return context;
	}

	BindContext.prototype._removeChildContext=function(identifier, index){
	  this._childContextMap.remove(index, identifier);
	}

	var forceSyncWithObserveTarget=function(targetMap, metaTraceId){
	  var keys;
	  if(metaTraceId){
	    var force = targetMap[metaTraceId];
	    if(force){
	      force.apply();
	    }
	  }else{
	    for(var k in targetMap){
	      targetMap[k].apply();
	    }
	  }
	}

	BindContext.prototype._forceSyncFromObserveTarget=function(metaTraceId){
	  forceSyncWithObserveTarget(this._forceSyncFromObserveTargetMap, metaTraceId);
	}

	BindContext.prototype._forceSyncToObserveTarget=function(metaTraceId){
	  forceSyncWithObserveTarget(this._forceSyncToObserveTargetMap, metaTraceId);
	}

	BindContext.prototype._bindMetaActions=function(meta){
	  if(meta._pre_binding){
	    for(var k=0;k<meta._pre_binding.length;k++){
	      meta._pre_binding[k].call(meta, this);
	    }
	  }
	  if(meta._register_on_change){
	    var changeHandler = meta._change_handler_creator.call(meta, this);
	    var force = meta._register_on_change.call(meta, this, function(){
	      changeHandler.apply(meta, arguments);
	    });
	    this._forceSyncFromObserveTargetMap[meta._meta_trace_id] = force;
	    force.apply();
	  }
	  if(meta._register_assign){
	    var assignChangeHandler = meta._assign_change_handler_creator.call(meta, this);
	    var force = meta._register_assign.call(meta, this, function(){
	      assignChangeHandler.apply(meta, arguments);
	      util.sync();
	    });
	    this._forceSyncToObserveTargetMap[meta._meta_trace_id] = force;
	  }
	  if(meta._post_binding){
	    for(var k=0;k<meta._post_binding.length;k++){
	      meta._post_binding[k].call(meta, this);
	    }
	  }
	}

	BindContext.prototype._bind=function(meta){  
	  if(Array.isArray(meta)){
	    for(var i=0;i<meta.length;i++){
	      this._bind(meta[i]);
	    }
	    return;
	  }
	  
	  if(!meta._meta_trace_id){
	    meta = normalizeMeta(meta);
	  }

	  var nonRecursive = ["_value", "_splice"];
	  for(var i in nonRecursive){
	    var sub = meta[nonRecursive[i]];
	    if(!sub){
	      continue;
	    }
	    for(var j=0;j<sub.length;j++){
	      var sm = sub[j];
	      this._bindMetaActions(sm);
	    };
	  }
	  
	  var propSub = meta._prop;
	  if(!propSub){
	    return;
	  }
	  
	  for(var i=0;i<propSub.length;i++){
	    var ps = propSub[i];
	    for(var p in ps){
	      var pm = ps[p];
	      if(typeof pm === "object"){
	        this._bind(pm);
	      }
	    }
	  }

	};

	BindContext.prototype._addDiscardHook=function(fn){
	  this._discardHook.push(fn);
	};

	BindContext.prototype._discard=function(){
	  var p;
	  for(var k in this){
	    p = this[k];
	    if(p && p.discard){
	      p.discard();
	    }
	  }
	  for(var i=0;i<this._discardHook.length;i++){
	    this._discardHook[i].apply();
	  }
	};

	module.exports=BindContext;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(14);

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var ResourceMap = __webpack_require__(16);

	var ValueMonitor=function(scope, varRefRoot){
	  this.scope = scope;
	  this.varRefRoot = varRefRoot;
	  this.observerMap = new ResourceMap();;
	}

	var convertObservePath=function(rootPath, subPath){
	  var observePath;
	  if(rootPath){
	    observePath = subPath ? rootPath + "." + subPath : rootPath;
	  }else{
	    observePath = subPath;
	  }
	  if(!observePath){
	      throw "The scope root cannot be observed";
	  }
	  return observePath;
	}

	ValueMonitor.prototype.createSubMonitor=function(subPath){
	  var observePath = convertObservePath(this.varRefRoot, subPath);
	  return new ValueMonitor(this.scope, observePath);
	};

	ValueMonitor.prototype.pathObserve=function(identifier, subPath, changeFn){
	  var observePath = convertObservePath(this.varRefRoot, subPath);
	  var observer = new _.PathObserver(this.scope, observePath);
	  observer.open(changeFn);
	  this.observerMap.add(observePath, identifier, observer);
	}

	function setValueWithSpawn(ref, path, value){
	  var dotIndex = path.indexOf(".");
	  if(dotIndex < 0){
	    ref[path] = value;
	  }else{
	    var firstSeg = path.substring(0, dotIndex);
	    var leftSeg = path.substring(dotIndex+1);
	    if(!ref[firstSeg]){
	      ref[firstSeg] = {};
	    }
	    setValueWithSpawn(ref[firstSeg], leftSeg, value);
	  }
	}

	ValueMonitor.prototype.getValueRef=function(subPath){
	  var observePath = convertObservePath(this.varRefRoot, subPath);
	  var path = _.Path.get(observePath);
	  var scope = this.scope;
	  return {
	    setValue : function(v, spawnUnreachablePath){
	      var success = path.setValueFrom(scope, v);
	      if(!success){//unreachable path
	          var spawn = spawnUnreachablePath;
	          if(spawn === undefined){
	            spawn = true; //default to generate all necessary sub path
	          }
	          if(spawn){
	            setValueWithSpawn(scope, observePath, v);
	          }
	      }
	    },
	    getValue : function(){
	      return path.getValueFrom(scope);
	    },
	  };
	}

	ValueMonitor.prototype.arrayObserve=function(identifier, targetArray, changeFn){
	  var observer = new _.ArrayObserver(targetArray);
	  observer.open(changeFn);
	  this.observerMap.add(identifier, identifier, observer);
	}
	ValueMonitor.prototype.removeArrayObserve=function(identifier){
	  this.observerMap.remove(identifier, identifier);
	}

	ValueMonitor.prototype.compoundObserve=function(identifier, pathes, changeFn){
	  var observer = new _.CompoundObserver();
	  var p;
	  for(var i=0;i<pathes.length;i++){
	    p = pathes[i];
	    if(p.indexOf("@:") == 0){//absolute path from scope root
	      p = p.substr(2);
	    }else{//relative path from current monitor ref path
	      p = convertObservePath(this.varRefRoot, p);
	    }
	    observer.addPath(this.scope, p);
	  }
	  observer.open(changeFn);
	  this.observerMap.add(identifier, identifier, observer);
	}

	ValueMonitor.prototype.getCompoundValueRef=function(pathes){
	  var ps = [];
	  var p;
	  for(var i=0;i<pathes.length;i++){
	    p = pathes[i];
	    if(p.indexOf("@:") == 0){//absolute path from scope root
	      p = p.substr(2);
	    }else{//relative path from current monitor ref path
	      p = convertObservePath(this.varRefRoot, p);
	    }
	    ps[i] = _.Path.get(p);
	  }
	  var scope = this.scope;
	  return {
	    setValues : function(values){
	      if(values.length != ps.length){
	        throw "length not equal for compound value set";
	      }
	      for(var i=0;i<values.length;i++){
	        ps[i].setValueFrom(scope, values[i]);
	      }
	    },
	    getValues : function(){
	      var values = [];
	      for(var i=0;i<ps.length;i++){
	        values[i] = ps[i].getValueFrom(scope);
	      }
	      return values;
	    },
	  };
	}

	ValueMonitor.prototype.discard=function(){
	  this.observerMap.discard();
	}

	module.exports=ValueMonitor;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/*
	 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */

	(function(global) {
	  'use strict';

	  var testingExposeCycleCount = global.testingExposeCycleCount;

	  // Detect and do basic sanity checking on Object/Array.observe.
	  function detectObjectObserve() {
	    if (typeof Object.observe !== 'function' ||
	        typeof Array.observe !== 'function') {
	      return false;
	    }

	    var records = [];

	    function callback(recs) {
	      records = recs;
	    }

	    var test = {};
	    var arr = [];
	    Object.observe(test, callback);
	    Array.observe(arr, callback);
	    test.id = 1;
	    test.id = 2;
	    delete test.id;
	    arr.push(1, 2);
	    arr.length = 0;

	    Object.deliverChangeRecords(callback);
	    if (records.length !== 5)
	      return false;

	    if (records[0].type != 'add' ||
	        records[1].type != 'update' ||
	        records[2].type != 'delete' ||
	        records[3].type != 'splice' ||
	        records[4].type != 'splice') {
	      return false;
	    }

	    Object.unobserve(test, callback);
	    Array.unobserve(arr, callback);

	    return true;
	  }

	  var hasObserve = detectObjectObserve();

	  function detectEval() {
	    // Don't test for eval if we're running in a Chrome App environment.
	    // We check for APIs set that only exist in a Chrome App context.
	    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
	      return false;
	    }

	    // Firefox OS Apps do not allow eval. This feature detection is very hacky
	    // but even if some other platform adds support for this function this code
	    // will continue to work.
	    if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
	      return false;
	    }

	    try {
	      var f = new Function('', 'return true;');
	      return f();
	    } catch (ex) {
	      return false;
	    }
	  }

	  var hasEval = detectEval();

	  function isIndex(s) {
	    return +s === s >>> 0 && s !== '';
	  }

	  function toNumber(s) {
	    return +s;
	  }

	  function isObject(obj) {
	    return obj === Object(obj);
	  }

	  var numberIsNaN = global.Number.isNaN || function(value) {
	    return typeof value === 'number' && global.isNaN(value);
	  }

	  function areSameValue(left, right) {
	    if (left === right)
	      return left !== 0 || 1 / left === 1 / right;
	    if (numberIsNaN(left) && numberIsNaN(right))
	      return true;

	    return left !== left && right !== right;
	  }

	  var createObject = ('__proto__' in {}) ?
	    function(obj) { return obj; } :
	    function(obj) {
	      var proto = obj.__proto__;
	      if (!proto)
	        return obj;
	      var newObject = Object.create(proto);
	      Object.getOwnPropertyNames(obj).forEach(function(name) {
	        Object.defineProperty(newObject, name,
	                             Object.getOwnPropertyDescriptor(obj, name));
	      });
	      return newObject;
	    };

	  var identStart = '[\$_a-zA-Z]';
	  var identPart = '[\$_a-zA-Z0-9]';
	  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

	  function getPathCharType(char) {
	    if (char === undefined)
	      return 'eof';

	    var code = char.charCodeAt(0);

	    switch(code) {
	      case 0x5B: // [
	      case 0x5D: // ]
	      case 0x2E: // .
	      case 0x22: // "
	      case 0x27: // '
	      case 0x30: // 0
	        return char;

	      case 0x5F: // _
	      case 0x24: // $
	        return 'ident';

	      case 0x20: // Space
	      case 0x09: // Tab
	      case 0x0A: // Newline
	      case 0x0D: // Return
	      case 0xA0:  // No-break space
	      case 0xFEFF:  // Byte Order Mark
	      case 0x2028:  // Line Separator
	      case 0x2029:  // Paragraph Separator
	        return 'ws';
	    }

	    // a-z, A-Z
	    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
	      return 'ident';

	    // 1-9
	    if (0x31 <= code && code <= 0x39)
	      return 'number';

	    return 'else';
	  }

	  var pathStateMachine = {
	    'beforePath': {
	      'ws': ['beforePath'],
	      'ident': ['inIdent', 'append'],
	      '[': ['beforeElement'],
	      'eof': ['afterPath']
	    },

	    'inPath': {
	      'ws': ['inPath'],
	      '.': ['beforeIdent'],
	      '[': ['beforeElement'],
	      'eof': ['afterPath']
	    },

	    'beforeIdent': {
	      'ws': ['beforeIdent'],
	      'ident': ['inIdent', 'append']
	    },

	    'inIdent': {
	      'ident': ['inIdent', 'append'],
	      '0': ['inIdent', 'append'],
	      'number': ['inIdent', 'append'],
	      'ws': ['inPath', 'push'],
	      '.': ['beforeIdent', 'push'],
	      '[': ['beforeElement', 'push'],
	      'eof': ['afterPath', 'push']
	    },

	    'beforeElement': {
	      'ws': ['beforeElement'],
	      '0': ['afterZero', 'append'],
	      'number': ['inIndex', 'append'],
	      "'": ['inSingleQuote', 'append', ''],
	      '"': ['inDoubleQuote', 'append', '']
	    },

	    'afterZero': {
	      'ws': ['afterElement', 'push'],
	      ']': ['inPath', 'push']
	    },

	    'inIndex': {
	      '0': ['inIndex', 'append'],
	      'number': ['inIndex', 'append'],
	      'ws': ['afterElement'],
	      ']': ['inPath', 'push']
	    },

	    'inSingleQuote': {
	      "'": ['afterElement'],
	      'eof': ['error'],
	      'else': ['inSingleQuote', 'append']
	    },

	    'inDoubleQuote': {
	      '"': ['afterElement'],
	      'eof': ['error'],
	      'else': ['inDoubleQuote', 'append']
	    },

	    'afterElement': {
	      'ws': ['afterElement'],
	      ']': ['inPath', 'push']
	    }
	  }

	  function noop() {}

	  function parsePath(path) {
	    var keys = [];
	    var index = -1;
	    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

	    var actions = {
	      push: function() {
	        if (key === undefined)
	          return;

	        keys.push(key);
	        key = undefined;
	      },

	      append: function() {
	        if (key === undefined)
	          key = newChar
	        else
	          key += newChar;
	      }
	    };

	    function maybeUnescapeQuote() {
	      if (index >= path.length)
	        return;

	      var nextChar = path[index + 1];
	      if ((mode == 'inSingleQuote' && nextChar == "'") ||
	          (mode == 'inDoubleQuote' && nextChar == '"')) {
	        index++;
	        newChar = nextChar;
	        actions.append();
	        return true;
	      }
	    }

	    while (mode) {
	      index++;
	      c = path[index];

	      if (c == '\\' && maybeUnescapeQuote(mode))
	        continue;

	      type = getPathCharType(c);
	      typeMap = pathStateMachine[mode];
	      transition = typeMap[type] || typeMap['else'] || 'error';

	      if (transition == 'error')
	        return; // parse error;

	      mode = transition[0];
	      action = actions[transition[1]] || noop;
	      newChar = transition[2] === undefined ? c : transition[2];
	      action();

	      if (mode === 'afterPath') {
	        return keys;
	      }
	    }

	    return; // parse error
	  }

	  function isIdent(s) {
	    return identRegExp.test(s);
	  }

	  var constructorIsPrivate = {};

	  function Path(parts, privateToken) {
	    if (privateToken !== constructorIsPrivate)
	      throw Error('Use Path.get to retrieve path objects');

	    for (var i = 0; i < parts.length; i++) {
	      this.push(String(parts[i]));
	    }

	    if (hasEval && this.length) {
	      this.getValueFrom = this.compiledGetValueFromFn();
	    }
	  }

	  // TODO(rafaelw): Make simple LRU cache
	  var pathCache = {};

	  function getPath(pathString) {
	    if (pathString instanceof Path)
	      return pathString;

	    if (pathString == null || pathString.length == 0)
	      pathString = '';

	    if (typeof pathString != 'string') {
	      if (isIndex(pathString.length)) {
	        // Constructed with array-like (pre-parsed) keys
	        return new Path(pathString, constructorIsPrivate);
	      }

	      pathString = String(pathString);
	    }

	    var path = pathCache[pathString];
	    if (path)
	      return path;

	    var parts = parsePath(pathString);
	    if (!parts)
	      return invalidPath;

	    var path = new Path(parts, constructorIsPrivate);
	    pathCache[pathString] = path;
	    return path;
	  }

	  Path.get = getPath;

	  function formatAccessor(key) {
	    if (isIndex(key)) {
	      return '[' + key + ']';
	    } else {
	      return '["' + key.replace(/"/g, '\\"') + '"]';
	    }
	  }

	  Path.prototype = createObject({
	    __proto__: [],
	    valid: true,

	    toString: function() {
	      var pathString = '';
	      for (var i = 0; i < this.length; i++) {
	        var key = this[i];
	        if (isIdent(key)) {
	          pathString += i ? '.' + key : key;
	        } else {
	          pathString += formatAccessor(key);
	        }
	      }

	      return pathString;
	    },

	    getValueFrom: function(obj, directObserver) {
	      for (var i = 0; i < this.length; i++) {
	        if (obj == null)
	          return;
	        obj = obj[this[i]];
	      }
	      return obj;
	    },

	    iterateObjects: function(obj, observe) {
	      for (var i = 0; i < this.length; i++) {
	        if (i)
	          obj = obj[this[i - 1]];
	        if (!isObject(obj))
	          return;
	        observe(obj, this[i]);
	      }
	    },

	    compiledGetValueFromFn: function() {
	      var str = '';
	      var pathString = 'obj';
	      str += 'if (obj != null';
	      var i = 0;
	      var key;
	      for (; i < (this.length - 1); i++) {
	        key = this[i];
	        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
	        str += ' &&\n     ' + pathString + ' != null';
	      }
	      str += ')\n';

	      var key = this[i];
	      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

	      str += '  return ' + pathString + ';\nelse\n  return undefined;';
	      return new Function('obj', str);
	    },

	    setValueFrom: function(obj, value) {
	      if (!this.length)
	        return false;

	      for (var i = 0; i < this.length - 1; i++) {
	        if (!isObject(obj))
	          return false;
	        obj = obj[this[i]];
	      }

	      if (!isObject(obj))
	        return false;

	      obj[this[i]] = value;
	      return true;
	    }
	  });

	  var invalidPath = new Path('', constructorIsPrivate);
	  invalidPath.valid = false;
	  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

	  var MAX_DIRTY_CHECK_CYCLES = 1000;

	  function dirtyCheck(observer) {
	    var cycles = 0;
	    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
	      cycles++;
	    }
	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;

	    return cycles > 0;
	  }

	  function objectIsEmpty(object) {
	    for (var prop in object)
	      return false;
	    return true;
	  }

	  function diffIsEmpty(diff) {
	    return objectIsEmpty(diff.added) &&
	           objectIsEmpty(diff.removed) &&
	           objectIsEmpty(diff.changed);
	  }

	  function diffObjectFromOldObject(object, oldObject) {
	    var added = {};
	    var removed = {};
	    var changed = {};

	    for (var prop in oldObject) {
	      var newValue = object[prop];

	      if (newValue !== undefined && newValue === oldObject[prop])
	        continue;

	      if (!(prop in object)) {
	        removed[prop] = undefined;
	        continue;
	      }

	      if (newValue !== oldObject[prop])
	        changed[prop] = newValue;
	    }

	    for (var prop in object) {
	      if (prop in oldObject)
	        continue;

	      added[prop] = object[prop];
	    }

	    if (Array.isArray(object) && object.length !== oldObject.length)
	      changed.length = object.length;

	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }

	  var eomTasks = [];
	  function runEOMTasks() {
	    if (!eomTasks.length)
	      return false;

	    for (var i = 0; i < eomTasks.length; i++) {
	      eomTasks[i]();
	    }
	    eomTasks.length = 0;
	    return true;
	  }

	  var runEOM = hasObserve ? (function(){
	    return function(fn) {
	      return Promise.resolve().then(fn);
	    }
	  })() :
	  (function() {
	    return function(fn) {
	      eomTasks.push(fn);
	    };
	  })();

	  var observedObjectCache = [];

	  function newObservedObject() {
	    var observer;
	    var object;
	    var discardRecords = false;
	    var first = true;

	    function callback(records) {
	      if (observer && observer.state_ === OPENED && !discardRecords)
	        observer.check_(records);
	    }

	    return {
	      open: function(obs) {
	        if (observer)
	          throw Error('ObservedObject in use');

	        if (!first)
	          Object.deliverChangeRecords(callback);

	        observer = obs;
	        first = false;
	      },
	      observe: function(obj, arrayObserve) {
	        object = obj;
	        if (arrayObserve)
	          Array.observe(object, callback);
	        else
	          Object.observe(object, callback);
	      },
	      deliver: function(discard) {
	        discardRecords = discard;
	        Object.deliverChangeRecords(callback);
	        discardRecords = false;
	      },
	      close: function() {
	        observer = undefined;
	        Object.unobserve(object, callback);
	        observedObjectCache.push(this);
	      }
	    };
	  }

	  /*
	   * The observedSet abstraction is a perf optimization which reduces the total
	   * number of Object.observe observations of a set of objects. The idea is that
	   * groups of Observers will have some object dependencies in common and this
	   * observed set ensures that each object in the transitive closure of
	   * dependencies is only observed once. The observedSet acts as a write barrier
	   * such that whenever any change comes through, all Observers are checked for
	   * changed values.
	   *
	   * Note that this optimization is explicitly moving work from setup-time to
	   * change-time.
	   *
	   * TODO(rafaelw): Implement "garbage collection". In order to move work off
	   * the critical path, when Observers are closed, their observed objects are
	   * not Object.unobserve(d). As a result, it's possible that if the observedSet
	   * is kept open, but some Observers have been closed, it could cause "leaks"
	   * (prevent otherwise collectable objects from being collected). At some
	   * point, we should implement incremental "gc" which keeps a list of
	   * observedSets which may need clean-up and does small amounts of cleanup on a
	   * timeout until all is clean.
	   */

	  function getObservedObject(observer, object, arrayObserve) {
	    var dir = observedObjectCache.pop() || newObservedObject();
	    dir.open(observer);
	    dir.observe(object, arrayObserve);
	    return dir;
	  }

	  var observedSetCache = [];

	  function newObservedSet() {
	    var observerCount = 0;
	    var observers = [];
	    var objects = [];
	    var rootObj;
	    var rootObjProps;

	    function observe(obj, prop) {
	      if (!obj)
	        return;

	      if (obj === rootObj)
	        rootObjProps[prop] = true;

	      if (objects.indexOf(obj) < 0) {
	        objects.push(obj);
	        Object.observe(obj, callback);
	      }

	      observe(Object.getPrototypeOf(obj), prop);
	    }

	    function allRootObjNonObservedProps(recs) {
	      for (var i = 0; i < recs.length; i++) {
	        var rec = recs[i];
	        if (rec.object !== rootObj ||
	            rootObjProps[rec.name] ||
	            rec.type === 'setPrototype') {
	          return false;
	        }
	      }
	      return true;
	    }

	    function callback(recs) {
	      if (allRootObjNonObservedProps(recs))
	        return;

	      var observer;
	      for (var i = 0; i < observers.length; i++) {
	        observer = observers[i];
	        if (observer.state_ == OPENED) {
	          observer.iterateObjects_(observe);
	        }
	      }

	      for (var i = 0; i < observers.length; i++) {
	        observer = observers[i];
	        if (observer.state_ == OPENED) {
	          observer.check_();
	        }
	      }
	    }

	    var record = {
	      objects: objects,
	      get rootObject() { return rootObj; },
	      set rootObject(value) {
	        rootObj = value;
	        rootObjProps = {};
	      },
	      open: function(obs, object) {
	        observers.push(obs);
	        observerCount++;
	        obs.iterateObjects_(observe);
	      },
	      close: function(obs) {
	        observerCount--;
	        if (observerCount > 0) {
	          return;
	        }

	        for (var i = 0; i < objects.length; i++) {
	          Object.unobserve(objects[i], callback);
	          Observer.unobservedCount++;
	        }

	        observers.length = 0;
	        objects.length = 0;
	        rootObj = undefined;
	        rootObjProps = undefined;
	        observedSetCache.push(this);
	        if (lastObservedSet === this)
	          lastObservedSet = null;
	      },
	    };

	    return record;
	  }

	  var lastObservedSet;

	  function getObservedSet(observer, obj) {
	    if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
	      lastObservedSet = observedSetCache.pop() || newObservedSet();
	      lastObservedSet.rootObject = obj;
	    }
	    lastObservedSet.open(observer, obj);
	    return lastObservedSet;
	  }

	  var UNOPENED = 0;
	  var OPENED = 1;
	  var CLOSED = 2;
	  var RESETTING = 3;

	  var nextObserverId = 1;

	  function Observer() {
	    this.state_ = UNOPENED;
	    this.callback_ = undefined;
	    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
	    this.directObserver_ = undefined;
	    this.value_ = undefined;
	    this.id_ = nextObserverId++;
	  }

	  Observer.prototype = {
	    open: function(callback, target) {
	      if (this.state_ != UNOPENED)
	        throw Error('Observer has already been opened.');

	      addToAll(this);
	      this.callback_ = callback;
	      this.target_ = target;
	      this.connect_();
	      this.state_ = OPENED;
	      return this.value_;
	    },

	    close: function() {
	      if (this.state_ != OPENED)
	        return;

	      removeFromAll(this);
	      this.disconnect_();
	      this.value_ = undefined;
	      this.callback_ = undefined;
	      this.target_ = undefined;
	      this.state_ = CLOSED;
	    },

	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;

	      dirtyCheck(this);
	    },

	    report_: function(changes) {
	      try {
	        this.callback_.apply(this.target_, changes);
	      } catch (ex) {
	        Observer._errorThrownDuringCallback = true;
	        console.error('Exception caught during observer callback: ' +
	                       (ex.stack || ex));
	      }
	    },

	    discardChanges: function() {
	      this.check_(undefined, true);
	      return this.value_;
	    }
	  }

	  var collectObservers = !hasObserve;
	  var allObservers;
	  Observer._allObserversCount = 0;

	  if (collectObservers) {
	    allObservers = [];
	  }

	  function addToAll(observer) {
	    Observer._allObserversCount++;
	    if (!collectObservers)
	      return;

	    allObservers.push(observer);
	  }

	  function removeFromAll(observer) {
	    Observer._allObserversCount--;
	  }

	  var runningMicrotaskCheckpoint = false;

	  global.Platform = global.Platform || {};

	  global.Platform.performMicrotaskCheckpoint = function() {
	    if (runningMicrotaskCheckpoint)
	      return;

	    if (!collectObservers)
	      return;

	    runningMicrotaskCheckpoint = true;

	    var cycles = 0;
	    var anyChanged, toCheck;

	    do {
	      cycles++;
	      toCheck = allObservers;
	      allObservers = [];
	      anyChanged = false;

	      for (var i = 0; i < toCheck.length; i++) {
	        var observer = toCheck[i];
	        if (observer.state_ != OPENED)
	          continue;

	        if (observer.check_())
	          anyChanged = true;

	        allObservers.push(observer);
	      }
	      if (runEOMTasks())
	        anyChanged = true;
	    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;

	    runningMicrotaskCheckpoint = false;
	  };

	  if (collectObservers) {
	    global.Platform.clearObservers = function() {
	      allObservers = [];
	    };
	  }

	  function ObjectObserver(object) {
	    Observer.call(this);
	    this.value_ = object;
	    this.oldObject_ = undefined;
	  }

	  ObjectObserver.prototype = createObject({
	    __proto__: Observer.prototype,

	    arrayObserve: false,

	    connect_: function(callback, target) {
	      if (hasObserve) {
	        this.directObserver_ = getObservedObject(this, this.value_,
	                                                 this.arrayObserve);
	      } else {
	        this.oldObject_ = this.copyObject(this.value_);
	      }

	    },

	    copyObject: function(object) {
	      var copy = Array.isArray(object) ? [] : {};
	      for (var prop in object) {
	        copy[prop] = object[prop];
	      };
	      if (Array.isArray(object))
	        copy.length = object.length;
	      return copy;
	    },

	    check_: function(changeRecords, skipChanges) {
	      var diff;
	      var oldValues;
	      if (hasObserve) {
	        if (!changeRecords)
	          return false;

	        oldValues = {};
	        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
	                                           oldValues);
	      } else {
	        oldValues = this.oldObject_;
	        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
	      }

	      if (diffIsEmpty(diff))
	        return false;

	      if (!hasObserve)
	        this.oldObject_ = this.copyObject(this.value_);

	      this.report_([
	        diff.added || {},
	        diff.removed || {},
	        diff.changed || {},
	        function(property) {
	          return oldValues[property];
	        }
	      ]);

	      return true;
	    },

	    disconnect_: function() {
	      if (hasObserve) {
	        this.directObserver_.close();
	        this.directObserver_ = undefined;
	      } else {
	        this.oldObject_ = undefined;
	      }
	    },

	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;

	      if (hasObserve)
	        this.directObserver_.deliver(false);
	      else
	        dirtyCheck(this);
	    },

	    discardChanges: function() {
	      if (this.directObserver_)
	        this.directObserver_.deliver(true);
	      else
	        this.oldObject_ = this.copyObject(this.value_);

	      return this.value_;
	    }
	  });

	  function ArrayObserver(array) {
	    if (!Array.isArray(array))
	      throw Error('Provided object is not an Array');
	    ObjectObserver.call(this, array);
	  }

	  ArrayObserver.prototype = createObject({

	    __proto__: ObjectObserver.prototype,

	    arrayObserve: true,

	    copyObject: function(arr) {
	      return arr.slice();
	    },

	    check_: function(changeRecords) {
	      var splices;
	      if (hasObserve) {
	        if (!changeRecords)
	          return false;
	        splices = projectArraySplices(this.value_, changeRecords);
	      } else {
	        splices = calcSplices(this.value_, 0, this.value_.length,
	                              this.oldObject_, 0, this.oldObject_.length);
	      }

	      if (!splices || !splices.length)
	        return false;

	      if (!hasObserve)
	        this.oldObject_ = this.copyObject(this.value_);

	      this.report_([splices]);
	      return true;
	    }
	  });

	  ArrayObserver.applySplices = function(previous, current, splices) {
	    splices.forEach(function(splice) {
	      var spliceArgs = [splice.index, splice.removed.length];
	      var addIndex = splice.index;
	      while (addIndex < splice.index + splice.addedCount) {
	        spliceArgs.push(current[addIndex]);
	        addIndex++;
	      }

	      Array.prototype.splice.apply(previous, spliceArgs);
	    });
	  };

	  function PathObserver(object, path) {
	    Observer.call(this);

	    this.object_ = object;
	    this.path_ = getPath(path);
	    this.directObserver_ = undefined;
	  }

	  PathObserver.prototype = createObject({
	    __proto__: Observer.prototype,

	    get path() {
	      return this.path_;
	    },

	    connect_: function() {
	      if (hasObserve)
	        this.directObserver_ = getObservedSet(this, this.object_);

	      this.check_(undefined, true);
	    },

	    disconnect_: function() {
	      this.value_ = undefined;

	      if (this.directObserver_) {
	        this.directObserver_.close(this);
	        this.directObserver_ = undefined;
	      }
	    },

	    iterateObjects_: function(observe) {
	      this.path_.iterateObjects(this.object_, observe);
	    },

	    check_: function(changeRecords, skipChanges) {
	      var oldValue = this.value_;
	      this.value_ = this.path_.getValueFrom(this.object_);
	      if (skipChanges || areSameValue(this.value_, oldValue))
	        return false;

	      this.report_([this.value_, oldValue, this]);
	      return true;
	    },

	    setValue: function(newValue) {
	      if (this.path_)
	        this.path_.setValueFrom(this.object_, newValue);
	    }
	  });

	  function CompoundObserver(reportChangesOnOpen) {
	    Observer.call(this);

	    this.reportChangesOnOpen_ = reportChangesOnOpen;
	    this.value_ = [];
	    this.directObserver_ = undefined;
	    this.observed_ = [];
	  }

	  var observerSentinel = {};

	  CompoundObserver.prototype = createObject({
	    __proto__: Observer.prototype,

	    connect_: function() {
	      if (hasObserve) {
	        var object;
	        var needsDirectObserver = false;
	        for (var i = 0; i < this.observed_.length; i += 2) {
	          object = this.observed_[i]
	          if (object !== observerSentinel) {
	            needsDirectObserver = true;
	            break;
	          }
	        }

	        if (needsDirectObserver)
	          this.directObserver_ = getObservedSet(this, object);
	      }

	      this.check_(undefined, !this.reportChangesOnOpen_);
	    },

	    disconnect_: function() {
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        if (this.observed_[i] === observerSentinel)
	          this.observed_[i + 1].close();
	      }
	      this.observed_.length = 0;
	      this.value_.length = 0;

	      if (this.directObserver_) {
	        this.directObserver_.close(this);
	        this.directObserver_ = undefined;
	      }
	    },

	    addPath: function(object, path) {
	      if (this.state_ != UNOPENED && this.state_ != RESETTING)
	        throw Error('Cannot add paths once started.');

	      var path = getPath(path);
	      this.observed_.push(object, path);
	      if (!this.reportChangesOnOpen_)
	        return;
	      var index = this.observed_.length / 2 - 1;
	      this.value_[index] = path.getValueFrom(object);
	    },

	    addObserver: function(observer) {
	      if (this.state_ != UNOPENED && this.state_ != RESETTING)
	        throw Error('Cannot add observers once started.');

	      this.observed_.push(observerSentinel, observer);
	      if (!this.reportChangesOnOpen_)
	        return;
	      var index = this.observed_.length / 2 - 1;
	      this.value_[index] = observer.open(this.deliver, this);
	    },

	    startReset: function() {
	      if (this.state_ != OPENED)
	        throw Error('Can only reset while open');

	      this.state_ = RESETTING;
	      this.disconnect_();
	    },

	    finishReset: function() {
	      if (this.state_ != RESETTING)
	        throw Error('Can only finishReset after startReset');
	      this.state_ = OPENED;
	      this.connect_();

	      return this.value_;
	    },

	    iterateObjects_: function(observe) {
	      var object;
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        object = this.observed_[i]
	        if (object !== observerSentinel)
	          this.observed_[i + 1].iterateObjects(object, observe)
	      }
	    },

	    check_: function(changeRecords, skipChanges) {
	      var oldValues;
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        var object = this.observed_[i];
	        var path = this.observed_[i+1];
	        var value;
	        if (object === observerSentinel) {
	          var observable = path;
	          value = this.state_ === UNOPENED ?
	              observable.open(this.deliver, this) :
	              observable.discardChanges();
	        } else {
	          value = path.getValueFrom(object);
	        }

	        if (skipChanges) {
	          this.value_[i / 2] = value;
	          continue;
	        }

	        if (areSameValue(value, this.value_[i / 2]))
	          continue;

	        oldValues = oldValues || [];
	        oldValues[i / 2] = this.value_[i / 2];
	        this.value_[i / 2] = value;
	      }

	      if (!oldValues)
	        return false;

	      // TODO(rafaelw): Having observed_ as the third callback arg here is
	      // pretty lame API. Fix.
	      this.report_([this.value_, oldValues, this.observed_]);
	      return true;
	    }
	  });

	  function identFn(value) { return value; }

	  function ObserverTransform(observable, getValueFn, setValueFn,
	                             dontPassThroughSet) {
	    this.callback_ = undefined;
	    this.target_ = undefined;
	    this.value_ = undefined;
	    this.observable_ = observable;
	    this.getValueFn_ = getValueFn || identFn;
	    this.setValueFn_ = setValueFn || identFn;
	    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
	    // at the moment because of a bug in it's dependency tracking.
	    this.dontPassThroughSet_ = dontPassThroughSet;
	  }

	  ObserverTransform.prototype = {
	    open: function(callback, target) {
	      this.callback_ = callback;
	      this.target_ = target;
	      this.value_ =
	          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
	      return this.value_;
	    },

	    observedCallback_: function(value) {
	      value = this.getValueFn_(value);
	      if (areSameValue(value, this.value_))
	        return;
	      var oldValue = this.value_;
	      this.value_ = value;
	      this.callback_.call(this.target_, this.value_, oldValue);
	    },

	    discardChanges: function() {
	      this.value_ = this.getValueFn_(this.observable_.discardChanges());
	      return this.value_;
	    },

	    deliver: function() {
	      return this.observable_.deliver();
	    },

	    setValue: function(value) {
	      value = this.setValueFn_(value);
	      if (!this.dontPassThroughSet_ && this.observable_.setValue)
	        return this.observable_.setValue(value);
	    },

	    close: function() {
	      if (this.observable_)
	        this.observable_.close();
	      this.callback_ = undefined;
	      this.target_ = undefined;
	      this.observable_ = undefined;
	      this.value_ = undefined;
	      this.getValueFn_ = undefined;
	      this.setValueFn_ = undefined;
	    }
	  }

	  var expectedRecordTypes = {
	    add: true,
	    update: true,
	    "delete": true
	  };

	  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
	    var added = {};
	    var removed = {};

	    for (var i = 0; i < changeRecords.length; i++) {
	      var record = changeRecords[i];
	      if (!expectedRecordTypes[record.type]) {
	        console.error('Unknown changeRecord type: ' + record.type);
	        console.error(record);
	        continue;
	      }

	      if (!(record.name in oldValues))
	        oldValues[record.name] = record.oldValue;

	      if (record.type == 'update')
	        continue;

	      if (record.type == 'add') {
	        if (record.name in removed)
	          delete removed[record.name];
	        else
	          added[record.name] = true;

	        continue;
	      }

	      // type = 'delete'
	      if (record.name in added) {
	        delete added[record.name];
	        delete oldValues[record.name];
	      } else {
	        removed[record.name] = true;
	      }
	    }

	    for (var prop in added)
	      added[prop] = object[prop];

	    for (var prop in removed)
	      removed[prop] = undefined;

	    var changed = {};
	    for (var prop in oldValues) {
	      if (prop in added || prop in removed)
	        continue;

	      var newValue = object[prop];
	      if (oldValues[prop] !== newValue)
	        changed[prop] = newValue;
	    }

	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }

	  function newSplice(index, removed, addedCount) {
	    return {
	      index: index,
	      removed: removed,
	      addedCount: addedCount
	    };
	  }

	  var EDIT_LEAVE = 0;
	  var EDIT_UPDATE = 1;
	  var EDIT_ADD = 2;
	  var EDIT_DELETE = 3;

	  function ArraySplice() {}

	  ArraySplice.prototype = {

	    // Note: This function is *based* on the computation of the Levenshtein
	    // "edit" distance. The one change is that "updates" are treated as two
	    // edits - not one. With Array splices, an update is really a delete
	    // followed by an add. By retaining this, we optimize for "keeping" the
	    // maximum array items in the original array. For example:
	    //
	    //   'xxxx123' -> '123yyyy'
	    //
	    // With 1-edit updates, the shortest path would be just to update all seven
	    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
	    // leaves the substring '123' intact.
	    calcEditDistances: function(current, currentStart, currentEnd,
	                                old, oldStart, oldEnd) {
	      // "Deletion" columns
	      var rowCount = oldEnd - oldStart + 1;
	      var columnCount = currentEnd - currentStart + 1;
	      var distances = new Array(rowCount);

	      // "Addition" rows. Initialize null column.
	      for (var i = 0; i < rowCount; i++) {
	        distances[i] = new Array(columnCount);
	        distances[i][0] = i;
	      }

	      // Initialize null row
	      for (var j = 0; j < columnCount; j++)
	        distances[0][j] = j;

	      for (var i = 1; i < rowCount; i++) {
	        for (var j = 1; j < columnCount; j++) {
	          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
	            distances[i][j] = distances[i - 1][j - 1];
	          else {
	            var north = distances[i - 1][j] + 1;
	            var west = distances[i][j - 1] + 1;
	            distances[i][j] = north < west ? north : west;
	          }
	        }
	      }

	      return distances;
	    },

	    // This starts at the final weight, and walks "backward" by finding
	    // the minimum previous weight recursively until the origin of the weight
	    // matrix.
	    spliceOperationsFromEditDistances: function(distances) {
	      var i = distances.length - 1;
	      var j = distances[0].length - 1;
	      var current = distances[i][j];
	      var edits = [];
	      while (i > 0 || j > 0) {
	        if (i == 0) {
	          edits.push(EDIT_ADD);
	          j--;
	          continue;
	        }
	        if (j == 0) {
	          edits.push(EDIT_DELETE);
	          i--;
	          continue;
	        }
	        var northWest = distances[i - 1][j - 1];
	        var west = distances[i - 1][j];
	        var north = distances[i][j - 1];

	        var min;
	        if (west < north)
	          min = west < northWest ? west : northWest;
	        else
	          min = north < northWest ? north : northWest;

	        if (min == northWest) {
	          if (northWest == current) {
	            edits.push(EDIT_LEAVE);
	          } else {
	            edits.push(EDIT_UPDATE);
	            current = northWest;
	          }
	          i--;
	          j--;
	        } else if (min == west) {
	          edits.push(EDIT_DELETE);
	          i--;
	          current = west;
	        } else {
	          edits.push(EDIT_ADD);
	          j--;
	          current = north;
	        }
	      }

	      edits.reverse();
	      return edits;
	    },

	    /**
	     * Splice Projection functions:
	     *
	     * A splice map is a representation of how a previous array of items
	     * was transformed into a new array of items. Conceptually it is a list of
	     * tuples of
	     *
	     *   <index, removed, addedCount>
	     *
	     * which are kept in ascending index order of. The tuple represents that at
	     * the |index|, |removed| sequence of items were removed, and counting forward
	     * from |index|, |addedCount| items were added.
	     */

	    /**
	     * Lacking individual splice mutation information, the minimal set of
	     * splices can be synthesized given the previous state and final state of an
	     * array. The basic approach is to calculate the edit distance matrix and
	     * choose the shortest path through it.
	     *
	     * Complexity: O(l * p)
	     *   l: The length of the current array
	     *   p: The length of the old array
	     */
	    calcSplices: function(current, currentStart, currentEnd,
	                          old, oldStart, oldEnd) {
	      var prefixCount = 0;
	      var suffixCount = 0;

	      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
	      if (currentStart == 0 && oldStart == 0)
	        prefixCount = this.sharedPrefix(current, old, minLength);

	      if (currentEnd == current.length && oldEnd == old.length)
	        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

	      currentStart += prefixCount;
	      oldStart += prefixCount;
	      currentEnd -= suffixCount;
	      oldEnd -= suffixCount;

	      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
	        return [];

	      if (currentStart == currentEnd) {
	        var splice = newSplice(currentStart, [], 0);
	        while (oldStart < oldEnd)
	          splice.removed.push(old[oldStart++]);

	        return [ splice ];
	      } else if (oldStart == oldEnd)
	        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

	      var ops = this.spliceOperationsFromEditDistances(
	          this.calcEditDistances(current, currentStart, currentEnd,
	                                 old, oldStart, oldEnd));

	      var splice = undefined;
	      var splices = [];
	      var index = currentStart;
	      var oldIndex = oldStart;
	      for (var i = 0; i < ops.length; i++) {
	        switch(ops[i]) {
	          case EDIT_LEAVE:
	            if (splice) {
	              splices.push(splice);
	              splice = undefined;
	            }

	            index++;
	            oldIndex++;
	            break;
	          case EDIT_UPDATE:
	            if (!splice)
	              splice = newSplice(index, [], 0);

	            splice.addedCount++;
	            index++;

	            splice.removed.push(old[oldIndex]);
	            oldIndex++;
	            break;
	          case EDIT_ADD:
	            if (!splice)
	              splice = newSplice(index, [], 0);

	            splice.addedCount++;
	            index++;
	            break;
	          case EDIT_DELETE:
	            if (!splice)
	              splice = newSplice(index, [], 0);

	            splice.removed.push(old[oldIndex]);
	            oldIndex++;
	            break;
	        }
	      }

	      if (splice) {
	        splices.push(splice);
	      }
	      return splices;
	    },

	    sharedPrefix: function(current, old, searchLength) {
	      for (var i = 0; i < searchLength; i++)
	        if (!this.equals(current[i], old[i]))
	          return i;
	      return searchLength;
	    },

	    sharedSuffix: function(current, old, searchLength) {
	      var index1 = current.length;
	      var index2 = old.length;
	      var count = 0;
	      while (count < searchLength && this.equals(current[--index1], old[--index2]))
	        count++;

	      return count;
	    },

	    calculateSplices: function(current, previous) {
	      return this.calcSplices(current, 0, current.length, previous, 0,
	                              previous.length);
	    },

	    equals: function(currentValue, previousValue) {
	      return currentValue === previousValue;
	    }
	  };

	  var arraySplice = new ArraySplice();

	  function calcSplices(current, currentStart, currentEnd,
	                       old, oldStart, oldEnd) {
	    return arraySplice.calcSplices(current, currentStart, currentEnd,
	                                   old, oldStart, oldEnd);
	  }

	  function intersect(start1, end1, start2, end2) {
	    // Disjoint
	    if (end1 < start2 || end2 < start1)
	      return -1;

	    // Adjacent
	    if (end1 == start2 || end2 == start1)
	      return 0;

	    // Non-zero intersect, span1 first
	    if (start1 < start2) {
	      if (end1 < end2)
	        return end1 - start2; // Overlap
	      else
	        return end2 - start2; // Contained
	    } else {
	      // Non-zero intersect, span2 first
	      if (end2 < end1)
	        return end2 - start1; // Overlap
	      else
	        return end1 - start1; // Contained
	    }
	  }

	  function mergeSplice(splices, index, removed, addedCount) {

	    var splice = newSplice(index, removed, addedCount);

	    var inserted = false;
	    var insertionOffset = 0;

	    for (var i = 0; i < splices.length; i++) {
	      var current = splices[i];
	      current.index += insertionOffset;

	      if (inserted)
	        continue;

	      var intersectCount = intersect(splice.index,
	                                     splice.index + splice.removed.length,
	                                     current.index,
	                                     current.index + current.addedCount);

	      if (intersectCount >= 0) {
	        // Merge the two splices

	        splices.splice(i, 1);
	        i--;

	        insertionOffset -= current.addedCount - current.removed.length;

	        splice.addedCount += current.addedCount - intersectCount;
	        var deleteCount = splice.removed.length +
	                          current.removed.length - intersectCount;

	        if (!splice.addedCount && !deleteCount) {
	          // merged splice is a noop. discard.
	          inserted = true;
	        } else {
	          var removed = current.removed;

	          if (splice.index < current.index) {
	            // some prefix of splice.removed is prepended to current.removed.
	            var prepend = splice.removed.slice(0, current.index - splice.index);
	            Array.prototype.push.apply(prepend, removed);
	            removed = prepend;
	          }

	          if (splice.index + splice.removed.length > current.index + current.addedCount) {
	            // some suffix of splice.removed is appended to current.removed.
	            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
	            Array.prototype.push.apply(removed, append);
	          }

	          splice.removed = removed;
	          if (current.index < splice.index) {
	            splice.index = current.index;
	          }
	        }
	      } else if (splice.index < current.index) {
	        // Insert splice here.

	        inserted = true;

	        splices.splice(i, 0, splice);
	        i++;

	        var offset = splice.addedCount - splice.removed.length
	        current.index += offset;
	        insertionOffset += offset;
	      }
	    }

	    if (!inserted)
	      splices.push(splice);
	  }

	  function createInitialSplices(array, changeRecords) {
	    var splices = [];

	    for (var i = 0; i < changeRecords.length; i++) {
	      var record = changeRecords[i];
	      switch(record.type) {
	        case 'splice':
	          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
	          break;
	        case 'add':
	        case 'update':
	        case 'delete':
	          if (!isIndex(record.name))
	            continue;
	          var index = toNumber(record.name);
	          if (index < 0)
	            continue;
	          mergeSplice(splices, index, [record.oldValue], 1);
	          break;
	        default:
	          console.error('Unexpected record type: ' + JSON.stringify(record));
	          break;
	      }
	    }

	    return splices;
	  }

	  function projectArraySplices(array, changeRecords) {
	    var splices = [];

	    createInitialSplices(array, changeRecords).forEach(function(splice) {
	      if (splice.addedCount == 1 && splice.removed.length == 1) {
	        if (splice.removed[0] !== array[splice.index])
	          splices.push(splice);

	        return
	      };

	      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
	                                           splice.removed, 0, splice.removed.length));
	    });

	    return splices;
	  }

	  // Export the observe-js object for **Node.js**, with backwards-compatibility
	  // for the old `require()` API. Also ensure `exports` is not a DOM Element.
	  // If we're in the browser, export as a global object.

	  var expose = global;

	  if (typeof exports !== 'undefined' && !exports.nodeType) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports;
	    }
	    expose = exports;
	  }

	  expose.Observer = Observer;
	  expose.Observer.runEOM_ = runEOM;
	  expose.Observer.observerSentinel_ = observerSentinel; // for testing.
	  expose.Observer.hasObjectObserve = hasObserve;
	  expose.ArrayObserver = ArrayObserver;
	  expose.ArrayObserver.calculateSplices = function(current, previous) {
	    return arraySplice.calculateSplices(current, previous);
	  };

	  expose.ArraySplice = ArraySplice;
	  expose.ObjectObserver = ObjectObserver;
	  expose.PathObserver = PathObserver;
	  expose.CompoundObserver = CompoundObserver;
	  expose.Path = Path;
	  expose.ObserverTransform = ObserverTransform;
	  
	})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(18)(module)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);
	var config = __webpack_require__(2);
	var constant = __webpack_require__(8)
	var Snippet = __webpack_require__(10)
	var normalizeMeta = __webpack_require__(11)


	var getOptionBindingHub=function(bindContext, identifier){
	  var info = bindContext._getResource("optionBindingHub", identifier);
	  if(!info){
	    info = {};
	    bindContext._addResource("optionBindingHub", identifier, info);
	  }
	  return info;
	}

	var throwMalformedOptionMeta=function(meta){
	  throw "There must be one property or a pair of _duplicator/_item (_item is ignorable) to be declared for option binding, but got:"
	        + JSON.stringify(meta);
	}
	var retrieveTargetPropMetaRoot=function(meta){
	  var checkKeys = Object.keys(meta);
	  if (checkKeys.length == 0) {
	    return meta;
	  }else if(checkKeys.length == 1){
	    if(checkKeys[0] === "_duplicator"){
	      return meta;
	    }else if(checkKeys[0] === "_item"){
	      return meta;
	    }else{
	      return retrieveTargetPropMetaRoot(meta[checkKeys[0]]);
	    }
	  }else if(checkKeys.length == 2){
	    if(checkKeys.indexOf("_duplicator") && checkKeys.indexOf("_item")){
	      return meta;
	    }else{
	      throwMalformedOptionMeta(meta);
	    }
	  }else{
	    throwMalformedOptionMeta(meta);
	  }
	}

	var defaultValueFn=function (v){
	  if(v.value === undefined){
	    return v;
	  }else{
	    return v.value;
	  }
	}

	var defaultTextFn=function(v){
	  if(v.text === undefined){
	    return v;
	  }else{
	    return v.text;
	  }
	};

	/*
	 * 
	 */
	var rewriteOptionMeta=function(optionMeta, inputType){
	  var newMeta = util.clone(optionMeta);
	  var targetPropMetaRoot = retrieveTargetPropMetaRoot(newMeta);
	  if(!targetPropMetaRoot._item){
	    targetPropMetaRoot._item = {};
	  }
	  
	  targetPropMetaRoot._value = function(newValue, oldValue, bindContext){
	    var fn = bindContext._optionBindingHub.notifyOptionChanged;
	    if(fn){
	      //delay it 3 delay cycle to make sure all the necessary change handlers related to option has finished.
	      util.delay(fn, 0, 3);
	    }
	  }
	  
	  //TODO we should handle splice but not now
	  /*
	  targetPropMetaRoot._splice = function(newValue, oldValue, bindContext){
	    var fn = bindContext.optionBindingHub.notifyOptionChange();
	    if(fn){
	      fn.apply();
	    }
	  }
	  */
	  
	  var itemDef = targetPropMetaRoot._item;
	  
	  var valueFn = itemDef._value ? itemDef._value : defaultValueFn;
	  delete itemDef._value;

	  var textFn = itemDef._text ? itemDef._text : defaultTextFn;
	  delete itemDef._text;
	  
	  if(inputType === "select"){
	    if(!targetPropMetaRoot._duplicator){
	      targetPropMetaRoot._duplicator = "option:not([aj-diverge-value]):first";
	    }
	    if(!itemDef._selector){
	      itemDef._selector = ":root";
	    }
	    if (!itemDef._render) {
	      itemDef._render = function (target, newValue, oldValue, bindContext) {
	        target.val(valueFn(newValue));
	        target.text(textFn(newValue));
	      };
	    }
	  }else if (inputType === "checkbox" || inputType === "radio"){
	    if(!targetPropMetaRoot._duplicator){
	       throw "_duplicator must be specified for options of checkbox or radio:" + JSON.stringify(targetPropMetaRoot);
	    }
	    if(!itemDef._selector){
	      itemDef._selector = ":root";
	    }
	    if(itemDef._register_dom_change || itemDef._register_assign || itemDef._assign){
	      throw "_register_dom_change/_register_assign/_assign cannot be specified for checkbox/radio option";
	    }else{
	      itemDef._register_dom_change = function (target, changeHandler, bindContext){
	        var optionContext = bindContext._parentContext;
	        var optionBindingHub = optionContext._optionBindingHub;
	        var changeEvents = optionBindingHub.changeEvents;
	        var events = optionBindingHub.changeEvents.join(" ");
	        target.find("input").bind(events, function () {
	          var je = $(this);
	          var value = je.val();
	          var checked = je.prop("checked");
	          changeHandler({
	            "value": value,
	            "checked": checked
	          }, bindContext);
	        });
	        //if there is click being bound to input, we do not need to bind any event on label
	        //because the click handle will be invoked automatically when the label is clicked.
	        if(changeEvents.indexOf("click") < 0){
	          target.find("label").bind(events, function(){
	            var je= $(this);
	            var id = je.attr("for");
	            var input = target.find("#" + id);
	            var value = input.val();
	            //label click may before checkbox "being clicked"
	            var checked = !input.prop("checked");
	            changeHandler({
	              "value": value,
	              "checked": checked
	            }, bindContext);
	          });  
	        }
	        /*
	        
	        */
	      }
	      itemDef._assign = function (changedValue, bindContext) {
	        var optionContext = bindContext._parentContext;
	        var optionBindingHub = optionContext._optionBindingHub;
	        var targetValueRef = optionBindingHub.targetValueRef;
	        var inputType = optionBindingHub.inputType;
	        
	        var value = changedValue.value;
	        var checked = changedValue.checked;
	        if(inputType === "checkbox"){
	          var newResult = util.regulateArray(targetValueRef.getValue());
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
	          targetValueRef.setValue(newResult);
	        }else{
	          targetValueRef.setValue(value);
	        }
	      } //_assign
	    } // else of (itemDef._register_dom_change || itemDef._assign)
	    if (!itemDef._render) {
	      itemDef._render = function (target, newValue, oldValue, bindContext) {
	        var optionContext = bindContext._parentContext;
	        var optionBindingHub = optionContext._optionBindingHub;
	        var snippet = bindContext._snippet;
	        var uid = util.createUID();
	        snippet.find(":root").attr("aj-option-binding", optionBindingHub.optionId);
	        snippet.find("input[type="+optionBindingHub.inputType+"]").attr("id", uid).val(valueFn(newValue));;
	        snippet.find("label").attr("for", uid).text(textFn(newValue));
	      };
	    }
	  }//end checkbox or radio
	  return normalizeMeta(newMeta);

	}//end optionRewrite

	module.exports={
	  rewriteOptionMeta : rewriteOptionMeta,
	  getOptionBindingHub : getOptionBindingHub
	}



/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var util = __webpack_require__(1);

	var discardNode=function(node){
	  if(node){
	    var discardable = node.discardable;
	    if(discardable._discard){
	      discardable._discard();
	    }else if(discardable.discard){
	      discardable.discard();
	    }else if(discardable.close){
	      discardable.close();
	    }else{
	      //
	    }
	  }
	}

	var ResourceList=function(){
	  this.head = {};
	  this.tail = this.head;
	}
	ResourceList.prototype.isEmpty=function(){
	  return !this.head.next;
	}

	ResourceList.prototype.add=function(identifier, discardable){
	  var node = {
	    identifier: identifier,
	    discardable: discardable
	  };
	  node.prev = this.tail;
	  this.tail.next = node;
	  
	  this.tail = node;
	  
	}

	ResourceList.prototype.remove=function(identifier){
	  var node = this.head.next;
	  while(node){
	    if(node.identifier === identifier){
	      discardNode(node);
	      node.prev.next = node.next;
	      if(node.next){
	        node.next.prev = node.prev;
	      }else{//node is the last
	        this.tail = node.prev;
	      }
	    }
	    node = node.next;
	  }
	}

	ResourceList.prototype.get=function(identifier){
	  var found;
	  var node = this.head.next;
	  while(node){
	    if(node.identifier === identifier){
	      found = node.discardable;
	      break;
	    }
	    node = node.next;
	  }
	  return found;
	}

	ResourceList.prototype.discard=function(){
	  var node = this.head.next;
	  while(node){
	    discardNode(node);
	    node = node.next;
	  }
	  //cannot be used any more
	  delete this.head;
	  delete this.tail;
	}

	var ResourceMap=function(){
	  this.map = {};
	}

	ResourceMap.prototype.getList=function(category){
	  var list = this.map[category];
	  if(!list){
	    list = new ResourceList();
	    this.map[category] = list;
	  }
	  return list;
	}

	ResourceMap.prototype.add=function(category, identifier, discardable){
	  var list = this.getList(category);
	  list.remove(identifier);
	  list.add(identifier, discardable);
	}

	ResourceMap.prototype.remove=function(category, identifier){
	  var list = this.getList(category);
	  list.remove(identifier);
	  if(list.isEmpty()){
	    delete this.map[category];
	  }
	};

	ResourceMap.prototype.get=function(category, identifier){
	  var list = this.getList(category);
	  return list.get(identifier);
	};

	ResourceMap.prototype.discard=function(){
	  for(var p in this.map){
	    this.map[p].discard();
	  }
	  delete this.map;
	}

	module.exports=ResourceMap;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var base64 = __webpack_require__(21)
	var ieee754 = __webpack_require__(19)
	var isArray = __webpack_require__(20)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var kMaxLength = 0x3fffffff
	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (subject, encoding) {
	  var self = this
	  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

	  var type = typeof subject
	  var length

	  if (type === 'number') {
	    length = +subject
	  } else if (type === 'string') {
	    length = Buffer.byteLength(subject, encoding)
	  } else if (type === 'object' && subject !== null) {
	    // assume object is array-like
	    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
	    length = +subject.length
	  } else {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (length > kMaxLength) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
	      kMaxLength.toString(16) + ' bytes')
	  }

	  if (length < 0) length = 0
	  else length >>>= 0 // coerce to uint32

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Preferred: Return an augmented `Uint8Array` instance for best performance
	    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
	  } else {
	    // Fallback: Return THIS instance of Buffer (created by `new`)
	    self.length = length
	    self._isBuffer = true
	  }

	  var i
	  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
	    // Speed optimization -- use set if we're copying from a typed array
	    self._set(subject)
	  } else if (isArrayish(subject)) {
	    // Treat array-ish objects as a byte array
	    if (Buffer.isBuffer(subject)) {
	      for (i = 0; i < length; i++) {
	        self[i] = subject.readUInt8(i)
	      }
	    } else {
	      for (i = 0; i < length; i++) {
	        self[i] = ((subject[i] % 256) + 256) % 256
	      }
	    }
	  } else if (type === 'string') {
	    self.write(subject, 0, encoding)
	  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (i = 0; i < length; i++) {
	      self[i] = 0
	    }
	  }

	  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

	  return self
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length
	  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, totalLength) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }

	  var i
	  if (totalLength === undefined) {
	    totalLength = 0
	    for (i = 0; i < list.length; i++) {
	      totalLength += list[i].length
	    }
	  }

	  var buf = new Buffer(totalLength)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	Buffer.byteLength = function byteLength (str, encoding) {
	  var ret
	  str = str + ''
	  switch (encoding || 'utf8') {
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      ret = str.length
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = str.length * 2
	      break
	    case 'hex':
	      ret = str.length >>> 1
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8ToBytes(str).length
	      break
	    case 'base64':
	      ret = base64ToBytes(str).length
	      break
	    default:
	      ret = str.length
	  }
	  return ret
	}

	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined

	// toString(encoding, start=0, end=buffer.length)
	Buffer.prototype.toString = function toString (encoding, start, end) {
	  var loweredCase = false

	  start = start >>> 0
	  end = end === undefined || end === Infinity ? this.length : end >>> 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	  return charsWritten
	}

	function asciiWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function utf16leWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	  return charsWritten
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Support both (string, offset, length, encoding)
	  // and the legacy (string, encoding, offset, length)
	  if (isFinite(offset)) {
	    if (!isFinite(length)) {
	      encoding = length
	      length = undefined
	    }
	  } else {  // legacy
	    var swap = encoding
	    encoding = offset
	    offset = length
	    length = swap
	  }

	  offset = Number(offset) || 0

	  if (length < 0 || offset < 0 || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  var remaining = this.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	  encoding = String(encoding || 'utf8').toLowerCase()

	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexWrite(this, string, offset, length)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Write(this, string, offset, length)
	      break
	    case 'ascii':
	      ret = asciiWrite(this, string, offset, length)
	      break
	    case 'binary':
	      ret = binaryWrite(this, string, offset, length)
	      break
	    case 'base64':
	      ret = base64Write(this, string, offset, length)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leWrite(this, string, offset, length)
	      break
	    default:
	      throw new TypeError('Unknown encoding: ' + encoding)
	  }
	  return ret
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }

	  return res + decodeUtf8Char(tmp)
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) >>> 0 & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  byteLength = byteLength >>> 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) >>> 0 & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) {
	    checkInt(
	      this, value, offset, byteLength,
	      Math.pow(2, 8 * byteLength - 1) - 1,
	      -Math.pow(2, 8 * byteLength - 1)
	    )
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) {
	    checkInt(
	      this, value, offset, byteLength,
	      Math.pow(2, 8 * byteLength - 1) - 1,
	      -Math.pow(2, 8 * byteLength - 1)
	    )
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset >>> 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, target_start, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (target_start >= target.length) target_start = target.length
	  if (!target_start) target_start = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (target_start < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - target_start < end - start) {
	    end = target.length - target_start + start
	  }

	  var len = end - start

	  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + target_start] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), target_start)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function isArrayish (subject) {
	  return isArray(subject) || Buffer.isBuffer(subject) ||
	      subject && typeof subject === 'object' &&
	      typeof subject.length === 'number'
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	  var i = 0

	  for (; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (leadSurrogate) {
	        // 2 leads in a row
	        if (codePoint < 0xDC00) {
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          leadSurrogate = codePoint
	          continue
	        } else {
	          // valid surrogate pair
	          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
	          leadSurrogate = null
	        }
	      } else {
	        // no lead yet

	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else {
	          // valid lead
	          leadSurrogate = codePoint
	          continue
	        }
	      }
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	      leadSurrogate = null
	    }

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x200000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17).Buffer))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity);
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};

	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

	  buffer[offset + i - d] |= s * 128;
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * isArray
	 */

	var isArray = Array.isArray;

	/**
	 * toString
	 */

	var str = Object.prototype.toString;

	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */

	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(false ? (this.base64js = {}) : exports))


/***/ }
/******/ ])
});
;