"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet");

var _duplicator = function(meta){
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
          throw "could not find duplicator:" + _duplicator;
        }
        
        target.each(function(index, elem){
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
          var changeContext = util.shallowCopy(bindContext);
          changeContext._observeTraceId = meta._trace_id + ":" + placeHolderId;
          changeContext._placeHolder = placeHolder;
          changeContext._templateStr = templateStr;
          changeContext._indexedPath = util.replaceIndexesInPath(propertyPath, bindContext._indexes);
          var observer = scope.registerPathObserver(changeContext._indexedPath, function(newValue, oldValue){
            changeHandler(newValue, oldValue, changeContext);
          }, changeContext._observeTraceId);
          snippet._discardHooks.push(function(){
            observer.close();
          });
          var observePath = _lib_observe.Path.get(changeContext._indexedPath);
          forceChange.push(function(){
            var v = observePath.getValueFrom(scope);
            changeHandler(v, undefined, changeContext);
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
      meta._on_change = function(newValue, oldValue, context){
        var scope = context._scope;
        var snippet = context._snippet;
        var target = context._target;
        var observeTraceId = context._observeTraceId;
        var placeHolder = context._placeHolder;
        var templateStr = context._templateStr;
        var currentPath = context._indexedPath;
        var itemMeta = this._item;
        
        var regularOld = util.regulateArray(oldValue);
        var regularNew = util.regulateArray(newValue);
        
        //var existingNodes = snippet._root.find("[aj-generated=" + placeHolderId + "]");
        var existingSubSnippets = util.getDataRef(placeHolder, "aj-place-holder-ref").subSnippets;
        if(!existingSubSnippets){
          existingSubSnippets = [];
          util.getDataRef(placeHolder, "aj-place-holder-ref").subSnippets = existingSubSnippets;
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
          scope.removeArrayObserver(currentPath, oldValue, observeTraceId);
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
          }, observeTraceId);//end array(splice) observe
        }
        if(meta._post_render){
          meta._post_render();
        }
      }//end meta._on_change
    }else{
      meta._on_change = function(){};
    }
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
      var snippet = bindContext.snippet;
      var target = snippet.find(selector);
      if(targetPath === "_index"){
        //we do not need to observe anything, just return a force render handler
        return function(){
          renderFn(target, snippet._index, undefined, bindContext);
        }
      }else if (targetPath == "_indexes"){
        //we do not need to observe anything, just return a force render handler
        return function(){
          renderFn(target, snippet._indexes, undefined, bindContext);
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
      var snippet = bindContext.snippet;
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


