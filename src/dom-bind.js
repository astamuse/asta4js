"use strict";

var _lib_observe = require("../lib/observe");

var util = require("./util");
var config = require("./config");
var constant = require("./constant")
var Snippet = require("./snippet");
var BindContext = require("./bind-context");

var $ = config.$;

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
  if(!meta._item){
    console.error("There is no corresponding _item define for duplicator:", duplicator);
  }
  var targetPath = meta._target_path;
  if(!meta._array_map && !meta._array_discard){
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
    
    meta._array_discard = function(bindContext){
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
        if(targets.length === 0 && !meta._omit_target_not_found){
          console.error("target is not found for duplicator:", duplicator, "current meta:", meta);
        }
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
      if(target.length === 0 && !meta._omit_target_not_found){
        console.error("could not find target of selector:", selector, meta);
      }
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
      if(target.length === 0 && !meta._omit_target_not_found){
          console.error("could not find target of selector:", selector, meta);
      }
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


