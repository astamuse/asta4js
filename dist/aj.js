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
	  metaRewritter: {},
	  scopeCreate: function(){
	      return new Scope();
	  }
	}

	module.exports = Aj;

/***/ }
/******/ ])
});
;