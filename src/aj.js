"use strict";

var Aj = {

  config : {
    metaFieldClassifier : function (metaId, fieldName) {
      if (fieldName === "_index") {
        return "_prop";
      } else if (fieldName.indexOf("_") === 0) {
        return "_value";
      } else {
        return "_prop";
      }
    },
    _ordered_metaFieldRewritter : null,
    _order_metaFieldRewritter : function () {
      if (!this._ordered_metaFieldRewritter) {
        var array = new Array();
        for (var k in this.metaFieldRewritter) {
          var def = this.metaFieldRewritter[k];
          var _priority = null;
          var _fn = null;
          if (typeof def === "object") {
            _priority = def.priority;
            _fn = def.fn;
          } else {
            _priority = 100;
            _fn = def;
          }
          array.push({
            key : k,
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
        this._ordered_metaFieldRewritter = array;
      }
    },
    metaFieldRewritter : {
      _form : function (scope, root, propertyPath, meta) {
        var formDef = meta._form;
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
          meta._render = function (target, newValue, oldValue) {
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
                  target.prop("checked", newValue);
                }else{
                  var va = Aj.util.regulateArray(newValue);
                  if(type === "radio" && va.length > 1){
                    throw "There are over than one candidate value for radio:" + va;
                  }
                  var unmatchedValue = [];
                  //there must be "aj-placeholder-id"
                  var placeHolderId = target.attr("aj-placeholder-id");
                  
                  //remove the auto generated diverge elements
                  root.find("[aj-diverge-value=" + placeHolderId + "]").remove();
                  
                  //find out all the existing options
                  var ops = root.find("[aj-generated=" + placeHolderId + "]").prop("checked", false);
                  va.forEach(function(v){
                    var foundInput = Aj.util.findWithRoot(ops, "input[value="+v+"]");
                    if(foundInput.length === 0){
                      unmatchedValue.push(v);
                    }else{
                      foundInput.prop("checked", true);
                    }
                  });
                  if(unmatchedValue.length > 0){
                    var insertPoint = root.find("#" + placeHolderId);
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
            Aj.util.getDataRef(target, "aj-form-binding-ref").value = newValue;
          } // end _render = function...
        } // end !meta._render

        if (formDef._option) {
          meta._post_binding.push(function (target) {
            formDef._option.bindAsSubSnippet(scope, root, target, function () {
              var currentDomValue = Aj.util.getDataRef(target, "aj-form-binding-ref").value;
              meta._render(target, currentDomValue, undefined);
            });
          });
        }
        
        if (!meta._register_assign) {
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
            meta._register_assign = function (target, onChange) {

              var ref = Aj.util.getDataRef(target, "aj-form-binding-ref");
              ref.changeEvents = changeEvents;

              var inputType;
              var tagName = target.prop("tagName");
              if(tagName === "INPUT"){
                inputType = target.attr("type");
                if(inputType){
                  inputType = inputType.toLowerCase();
                }
              }
              if(inputType === "checkbox" || inputType === "radio"){
                if(formDef._single_check){
                  target.bind(changeEvents.join(" "), function () {
                    var v = $(this).prop("checked");
                    onChange(v);
                  }); 
                }else{
                  var observer = new PathObserver(ref, "value");
                  observer.open(function(newValue, oldValue){
                    onChange(newValue);
                  });
                }
              }else{
                target.bind(changeEvents.join(" "), function () {
                  var v = $(this).val();
                  onChange(v);
                }); 
              }
            }// end meta._register_assign
          };// end changeEvents.length > 0
        }// end !meta._register_assign
      },// end _form
      _watch : function (scope, root,propertyPath, meta) {
        var watchMap = scope.__watch__map__;
        if(!watchMap){
          watchMap = {};
          scope.__watch__map__ = watchMap;
        }
        
        var watchDef = meta._watch;
        
        var parentPath = propertyPath;
        var dotIdx = parentPath.lastIndexOf(".");
        if(dotIdx >= 0){
          parentPath = parentPath.substring(0, dotIdx);
        }
        
        var observerTargets = watchDef._fields.map(function(f){
          var path;
          if(f.indexOf("@:") == 0){
            path = f.substr(2);
          }else{
            path = parentPath + "." + f;
          }
          return path;
        });
        
        if(!meta._assign){
          meta._assign = function (_scope, propertyPath, value){
            watchMap[propertyPath] = value;
            if(watchDef._store){
              Path.get(propertyPath).setValueFrom(_scope, value);
            }
          };
        }
        if (!meta._register_render) {
          meta._register_render = function (_scope, propertyPath, onChange) {
            var observer = new PathObserver(_scope, "__watch__map__['" + propertyPath + "']");
            observer.open(function (newValue, oldValue) {
              onChange(newValue, oldValue);
            });
          };
        }
        if(!meta._register_assign){
          meta._register_assign = function (target, onChange){
            var firstValues = [];
            var observer = new CompoundObserver();
            observerTargets.forEach(function(observerPath){
              firstValues.push(Path.get(observerPath).getValueFrom(scope));
              observer.addPath(scope, observerPath);
            });

            //before open observer, let's store the initial value
            var initialValue;
            if(watchDef._cal){
              initialValue = watchDef._cal.apply(null, firstValues);
            }else{
              initialValue = newValues;
            }
            watchMap[propertyPath] = initialValue;
            if(watchDef._store){
              Path.get(propertyPath).setValueFrom(scope, initialValue);
            }
            
            //open observer
            observer.open(function(newValues, oldValues){
              if(watchDef._cal){
                onChange(watchDef._cal.apply(null, newValues));
              }else{
                onChange(newValues);
              }
            });
          }
        }
        if(!meta._first_time_value){
          meta._first_time_value = function(_scope, propertyPath, target){
            return watchMap[propertyPath];
          };
        }

      },
      _selector : {
        priority : 10000000 - 1, // a little smaller than bigger
        fn : function (scope, root,propertyPath, meta) {
          if (meta._selector) { // when(why) is it undefined?
            //rewrite selector to extract attr operations
            var attrOpIndex = meta._selector.indexOf("@>");
            if (attrOpIndex >= 0) {
              meta._attr_op = meta._selector.substr(attrOpIndex + 2);
              meta._selector = meta._selector.substring(0, attrOpIndex);
            }
          }
        }
      },
      _attr_op : {
        priority : 10000000, // bigger than bigger
        fn : function (scope, root, propertyPath, meta){
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
                       + originalMeta._selector;
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
            console.log("attrOp=" + attrOp);
            for (var i = 0; i < attrRegs.length; i++) {
              var attrReg = attrRegs[i];
              var matchResult = attrReg.reg.exec(attrOp);
              if (matchResult) {
                console.log("matched");
                console.log(attrReg);
                var matched = matchResult[1];
                renderFn = attrReg.renderFn(matched);
                break;
              }
              //console.log("not matched");
            }

            if (renderFn) {
              meta._render = renderFn;
            } else {
              throw "not supported attr operation:" + attrOp;
            }
          }
        }
      }
    }
  },

  sync : function () {
    //setTimeout(function(){
      Platform.performMicrotaskCheckpoint();
    //},0);
  },

  obs : new Array(),

  init : function (init_func) {
    init_func(Aj.createScope());
    setTimeout(function(){
      Aj.sync();
    }, 0);
  },

  createScope : function () {
    return {
      snippet : function (selector) {
        return Aj.createSnippet(this, $(selector));
      },
      observe: function(varRef, meta){
        var rewriteMeta = function(m){
          var newMeta = {};
          var maybeArray = false;
          for(var p in m){
            //we need to avoid scope issue
            (function(){
              var submeta = m[p];
              var type = typeof submeta;
              if( type === "function"){
                newMeta[p] = {
                  _selector: ":root",
                  _render: function(target, newValue, oldValue){
                    submeta(newValue, oldValue);
                    Aj.sync();
                  }
                }
              }else if (type === "object"){
                if(Array.isArray(submeta)){
                  newMeta[p] = submeta.map(function(a){
                    if(typeof a === "function"){
                      var dummy = {
                        "x": a
                      }
                      return rewriteMeta(dummy)["x"];
                    }else{
                      return rewriteMeta(a);
                    }
                  });
                }else{
                  newMeta[p] = rewriteMeta(submeta);
                }
              }else{
                throw "you can only declare function on observe"
              }
              if(p === "_item"){
                maybeArray = true;
              }
            })();
          }
          if(maybeArray){
            newMeta._duplicator = "#_for_observe#";//we will change this dirty things later
          }
          return newMeta;
        }
        var mmm = rewriteMeta(meta);
        var dummySnippet = this.snippet("body").bind(varRef, mmm);
      }
    };
  },

  createSnippet : function (_scope, _root) {
    var reverseMetaKeys = ["_meta_type", "_meta_id", "_value", "_prop"];
    return {
      rewriteMeta : function (propertyPath, originalMeta) {

        var meta = Aj.util.clone(originalMeta);

        //now we will call the registered meta rewritter to rewrite the meta
        Aj.config._order_metaFieldRewritter();
        console.log(Aj.config._ordered_metaFieldRewritter);
        Aj.config._ordered_metaFieldRewritter.forEach(function (mr) {
          if (meta[mr.key] !== undefined) {
            mr.fn(_scope, _root, propertyPath, meta);
            if (mr.key !== "_selector") {
              meta[mr.key] = null;
              delete meta[mr.key];
            }
          }
        });

        if (!meta._render) {
          meta._render = function (target, newValue, oldValue) {
            target.text(newValue);
          };
        }

        if (!meta._assign) {
          meta._assign = function (_scope, propertyPath, value) {
            Path.get(propertyPath).setValueFrom(_scope, value);
          };
        }
        if (!meta._register_render) {
          meta._register_render = function (_scope, propertyPath, onChange) {
            var observer = new PathObserver(_scope, propertyPath);
            observer.open(function (newValue, oldValue) {
              onChange(newValue, oldValue);
            });
          };
        }
        /*
        if(!meta._register_assign){
        meta._register_assign = function(target, onChange){
        target.change(function(){
        var v = $(this).val();
        });
        }
        }
         */

        return meta;
      },

      bind : function (varRef, meta) {
        var refPath = Aj.util.determineRefPath(_scope, varRef);
        this.bindMeta(refPath, meta);
        return this;
      },

      bindMeta : function (parentPath, originalMeta, arrayIndex) {

        // if the user defined root meta is an array, we can bind then one by one
        if ($.isArray(originalMeta)) {
          var THIS = this;
          originalMeta.forEach(function (m) {
            THIS.bindMeta(parentPath, m, arrayIndex)
          });
          return;
        }

        //convert string to standard meta format
        var metaType = typeof originalMeta;
        var meta;
        if (metaType === "string") {
          meta = {
            _selector : originalMeta
          }
        } else if (metaType === "object") {
          meta = Aj.util.clone(originalMeta);
        } else {
          throw "meta must be a string or object rather than " + metaType;
        }

        //the only possible no-type meta is passed by user defined root meta
        //which must be the root
        if (!meta._meta_type) {
          meta._meta_type = "_root";
        }

        switch (meta._meta_type) {
        case "_root":
          //if the _value is array, we should create a new empty object to receive the moved fields from _root
          var _value_ref;
          if (!meta._value) {
            meta._value = {};
            _value_ref = meta._value;
          } else if ($.isArray(meta._value)) {
            //make sure all the _meta_type of elements of _vlaue be "_value"
            meta._value.forEach(function (v) {
              v._meta_type = "_value";
            });
            _value_ref = {};
            meta._value.push(_value_ref);
          } else {
            _value_ref = meta._value;
          }
          _value_ref._meta_type = "_value";

          //the same as _value
          var _prop_ref;
          if (!meta._prop) {
            meta._prop = {};
            _prop_ref = meta._prop;
          } else if ($.isArray(meta._prop)) {
            meta._prop.forEach(function (v) {
              v._meta_type = "_prop";
            });
            _prop_ref = {};
            meta._prop.push(_prop_ref);
          } else {
            _prop_ref = meta._prop;
          }
          _prop_ref._meta_type = "_prop";

          var moveTargetRef = {
            _value : _value_ref,
            _prop : _prop_ref
          }
          //we need to move all the fields under root to the corresponding standard holding fields: _value or _prop

          for (var p in meta) {
            if (reverseMetaKeys.indexOf(p) >= 0) {
              continue;
            }
            var moveTarget = Aj.config.metaFieldClassifier(meta._meta_id, p);
            if (moveTarget === "_value" || moveTarget === "_prop") {
              moveTargetRef[moveTarget][p] = meta[p];
              meta[p] = null;
              delete meta[p];
            } else {
              throw "metaFieldClassifier can only return '_value' or '_prop' rather than '" + moveTarget + "'";
            }
          }
          // now we can bind the _value and _prop one by one
          this.bindMeta(parentPath, meta._value, arrayIndex);
          this.bindMeta(parentPath, meta._prop, arrayIndex);
          break;
        case "_prop":
          this.bindProperty(parentPath, meta, arrayIndex);
          break;
        case "_value":
          this.bindValue(parentPath, meta, arrayIndex);
          break;
        default:
          throw "impossible meta type:" + meta._meta_type;
        }
      },

      bindProperty : function (parentPath, originalMeta, arrayIndex) {
        if (originalMeta._meta_type !== "_prop") {
          throw "Only _prop meta can be bound to here but got:" + originalMeta._meta_type;
        }
        for (var p in originalMeta) {
          if (reverseMetaKeys.indexOf(p) >= 0) {
            continue;
          }
          var m = originalMeta[p];
          if (p === "_index") {
            this.bindMeta(p, m, arrayIndex);
          } else {
            this.bindMeta(parentPath + "." + p, m);
          }
        }
      },

      bindValue : function (propertyPath, originalMeta, arrayIndex) {
        if (originalMeta._meta_type !== "_value") {
          throw "Only _value meta can be bound to here but got:" + originalMeta._meta_type;
        }

        //special binding for array
        if (originalMeta._duplicator) {
          this.bindArray(propertyPath, originalMeta);
          return;
        }

        var meta = Aj.util.clone(originalMeta);
        meta._post_binding = [];

        //special for _index path
        if (propertyPath === "_index") {
          //do nothing if binding for array index
          if (!meta._assign) {
            meta._assign = function (_scope, propertyPath, value) {};
          }
          if (!meta._register_render) {
            meta._register_render = function (_scope, propertyPath, onChange) {};
          }
        }

        //rewrite meta
        meta = this.rewriteMeta(propertyPath, meta);

        //which means there is nothing about the value to do
        if (!meta._selector) {
          return;
        }

        //retrieve target
        var target = Aj.util.findWithRoot(_root, meta._selector);
        if (target.length === 0) {
          throw "could not found target for selector:" + meta._selector + " under root element:" + _root.selector;
        }

        //register actions
        if (meta._register_render) {
          meta._register_render(
            _scope,
            propertyPath,
            function (newValue, oldValue) {
            meta._render(target, newValue, oldValue);
            Aj.sync();
          });
          var currentValue = null;
          if(meta._first_time_value){
            currentValue = meta._first_time_value(_scope, propertyPath, target);
          }else{
            if (propertyPath === "_index") {
              currentValue = arrayIndex;
            } else {
              currentValue = Path.get(propertyPath).getValueFrom(_scope);
            }
          }
          meta._render(target, currentValue, undefined);
        }

        if (meta._register_assign) {
          meta._register_assign(target, function (value) {
            meta._assign(_scope, propertyPath, value);
            Aj.sync();
          });
        }

        //post binding
        meta._post_binding.forEach(function (pf) {
          pf(target);
        });
        
        if(meta._debug){
          console.log("bind " + propertyPath + " as following:");
          console.log(meta);
          console.log(meta._render.toString());
        }
      },
      
      bindArray : function (propertyPath, originalMeta) {
        var forObserverOnly = (originalMeta._duplicator === "#_for_observe#");
        var target;
        if(forObserverOnly){// for observer only
          target = _root;
        }else{
          target = Aj.util.findWithRoot(_root, originalMeta._duplicator);
          if (target.length == 0) {
            throw "could not find duplicator:" + originalMeta._duplicator;
          }
        }

        var THIS = this;
        var childMeta = Aj.util.clone(originalMeta["_item"]);

        target.each(function (index, elem) {
          
          var placeHolder;
          var templateStr;

          if(!forObserverOnly){
            //create placle holder
            var tagName = elem.tagName;
            var placeHolderId = Aj.util.createUID();
            if( (tagName === "OPTION" || tagName === "OPTGROUP") && $.browser !== "mozilla"){
              tagName = "span";
            }
            placeHolder = $("<" + tagName + " style='display:none' id='" + placeHolderId + "' value='SFDASF#$#RDFVC%&!#$%%2345sadfasfd'/>");
            var $elem = $(elem);
            $elem.after(placeHolder);

            //$elem.attr("aj-placeholder-id",placeHolderId);
            //remove the duplicate target
            $elem.remove();
            $elem.attr("aj-generated", placeHolderId);

            templateStr = $("<div>").append($elem).html();
            
            //set the placeholder id to all the children input elements for the sake of checkbox/radio box option rendering
            $elem.find("input").attr("aj-placeholder-id", placeHolderId);
          }

          var observerFunc = function (newValue, oldValue) {
            /*
             * we should monitor the array splicing
             */
            if ($.isArray(newValue)) { // only when the new value is not undefined/null
              var splicingObserver = new ArrayObserver(newValue);
              splicingObserver.open(function (splices) {
                /*
                if(forObserverOnly){
                  //we need register the length onchange handler but we cannot get it right now.
                  //we will address this after refactoring
                  return;
                }
                */
                var removedCount = 0;
                var addedCount = 0;

                splices.forEach(function (s) {
                  removedCount += s.removed.length;
                  addedCount += s.addedCount;
                });

                var diff = addedCount - removedCount;
                
                if(forObserverOnly){
                  if(diff > 0){
                    var currentLen = newValue.length;
                    var oldLen = currentLen - diff;
                    for(var i=oldLen;i<currentLen;i++){
                      var childPath = propertyPath + "[" + i + "]";
                      //recursive binding
                      var childSnippet = Aj.createSnippet(_scope, target);
                      childSnippet.bindMeta(childPath, childMeta);
                    }
                  }
                }else{

                  var existingNodes = _root.find("[aj-generated=" + placeHolderId + "]");
                  var existingLength = existingNodes.length;

                  if (diff > 0) {
                    //we simply add the new child to the last of current children list,
                    //all the values will be synchronized correctly since we bind them
                    //by a string value path rather than the real object reference
                    
                    // the last one as insert point or the placeholder
                    var insertPoint = $(existingNodes.get(existingLength - 1)); 
                    if(insertPoint.length == 0){
                      insertPoint = placeHolder;
                    }
                    
                    for (var i = 0; i < diff; i++) {
                      var newIndex = existingLength + i;
                      var childPath = propertyPath + "[" + newIndex + "]";
                      var childElem = $(templateStr);
                      insertPoint.after(childElem);

                      console.log("bind childpath:" + childPath);
                      console.log(childMeta);

                      //recursive binding
                      var childSnippet = Aj.createSnippet(_scope, childElem);
                      childSnippet.bindMeta(childPath, childMeta, newIndex);

                      insertPoint = childElem;
                    }
                  } else if (diff < 0) {
                    diff = 0 - diff;
                    for (var i = 1; i <= diff; i++) {
                      $(existingNodes.get(existingLength - i)).remove();
                    }
                  }
                }

                //post rendering
                if (originalMeta._post_render) {
                  originalMeta._post_render();
                }
              });
            }
            
            var regularOld = Aj.util.regulateArray(oldValue);
            var regularNew = Aj.util.regulateArray(newValue);

            if(forObserverOnly){
              var len = regularNew.length;
              for(var i=0;i<len;i++){
                var childPath = propertyPath + "[" + i + "]";
                //recursive binding
                var childSnippet = Aj.createSnippet(_scope, target);
                childSnippet.bindMeta(childPath, childMeta);
              }
              return;
            }

            /*
             * following is for value assigning by whole array instance
             */
            var existingNodes = _root.find("[aj-generated=" + placeHolderId + "]");



            var newLength = regularNew.length;
            var nodeLength = existingNodes.length;

            var i = 0; // loop for value
            var j = 0; // loop for node

            var insertPoint = placeHolder;

            //we will diff the old and new and try our best to reuse the existing DOMs
            for (; i < newLength && j < nodeLength; i++, j++) {
              var childPath = propertyPath + "[" + i + "]";
              var childElem = $(existingNodes.get(j));
              //todo retrieve the existing observer and onChange event handler

              console.log("bind childpath:" + childPath);
              console.log(childMeta);

              //recursive binding
              var childSnippet = Aj.createSnippet(_scope, childElem);
              childSnippet.bindMeta(childPath, childMeta, i);

              insertPoint = childElem;
            } // end i,j

            for (; i < newLength; i++) {
              var childPath = propertyPath + "[" + i + "]";
              var childElem = $(templateStr);
              insertPoint.after(childElem);

              console.log("bind childpath:" + childPath);
              console.log(childMeta);

              //recursive binding
              var childSnippet = Aj.createSnippet(_scope, childElem);
              childSnippet.bindMeta(childPath, childMeta, i);

              insertPoint = childElem;
            } // end i

            for (; j < nodeLength; j++) {
              var childElem = existingNodes.get(j);
              //todo retrieve the existing observer and onChange event handler
              childElem.remove();
            }

            //post rendering
            if (originalMeta._post_render) {
              originalMeta._post_render();
            }

          }; // observerFunc
          var observer = new PathObserver(_scope, propertyPath);
          observer.open(observerFunc);

          var currentValue = Path.get(propertyPath).getValueFrom(_scope);
          observerFunc(Aj.util.regulateArray(currentValue, true), []);

        }); //target.each
      }, //bindArray


      discard : function () {
        //TODO
      },

      on : function (event, selector, fn) {
        _root.on(event, selector, function(){
          fn.apply(this, arguments);
          Aj.sync();
        });
        return this;
      }

    } //return snippet
  }, //create snippet

  optionBind : function (_varRef, _meta) {
    var varRef = _varRef;
    var meta;
    if (typeof _meta === "string") {
      meta = {};
      meta[_meta] = {};
    } else {
      meta = Aj.util.clone(_meta);
    }

    var checkKeys = Object.keys(meta);
    if (checkKeys.length !== 1) {
      throw "There can only be one property declaration in option binding, but got:" + checkKeys;
    }

    var bindingMeta = meta[checkKeys[0]];
    var itemDef = bindingMeta._item; 
    if (!bindingMeta._item) {
      bindingMeta._item = {};
    }
    var itemDef = bindingMeta._item;
    
    //move all the properties to _item
    for (var p in bindingMeta) {
      if (p === "_duplicator" || p === "_item") {
        continue;
      }
      itemDef[p] = bindingMeta[p];
      delete bindingMeta[p];
    }

    //we do not want there are other properties from "_duplicator" and "_item"
    for (var p in bindingMeta) {
      if (p === "_duplicator" || p === "_item") {
        continue;
      }
      throw "Only _duplicator and _item are allowed under option binding but found:" + p;
    }

    
    var valueFn = itemDef._value ? itemDef._value : function (v) {
      return v;
    };
    delete itemDef._value;

    var textFn = itemDef._text ? itemDef._text : function (v) {
      return v;
    };
    delete itemDef._text;

    var op = {};
    op.bindAsSubSnippet = function (scope, root, target, onOptionChange) {
      var snippetRoot;
      
      //rewrite post render
      if(bindingMeta._post_render){
        var pr = bindingMeta._post_render;
        bindingMeta._post_render = function(){
          onOptionChange();
          pr();
        }
      }else{
        bindingMeta._post_render = onOptionChange;
      }
      
      //rewrite render by type
      var tagName = target.prop("tagName");
      switch (tagName) {
      case "SELECT":
        snippetRoot = target;
        if (!bindingMeta._duplicator) {
          bindingMeta._duplicator = "option:first"; //we will always use the first option as template
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
        var type = target.attr("type");
        if(type){
          type = type.toLowerCase();
        }
        if(type=== "checkbox" || type === "radio"){
          if (!bindingMeta._duplicator) {
            throw "_duplicator must be specified for options of checkbox or radio";
          }

          //find out the parent of duplicator
          var parent = target;
          while(!parent.is(bindingMeta._duplicator)){
            parent = parent.parent();
          }
          snippetRoot = parent.parent();
          
          if (!itemDef._selector) {
            itemDef._selector = ":root";
          }
          if(itemDef._register_assign || itemDef._assign){
            throw "_register_assign/_assign cannot be specified for checkbox/radio option";
          }else{
            var ref = Aj.util.getDataRef(target, "aj-form-binding-ref");
            if(ref.changeEvents.length > 0){
              itemDef._register_assign = function (target, onChange){
                var events = ref.changeEvents.join(" ");
                target.find("input").bind(events, function () {
                  var je = $(this);
                  var value = je.val();
                  var checked = je.prop("checked");
                  onChange({
                    "value": value,
                    "checked": checked
                  });
                });
                target.find("label").bind(events, function(){
                  var je= $(this);
                  var id = je.attr("for");
                  var input = target.find("#" + id);
                  target[ref.changeEvents[0]].apply();
                });
              }
              itemDef._assign = function (_scope, propertyPath, value) {
                  if(type === "checkbox"){
                    var newResult = Aj.util.regulateArray(ref.value);
                    var v = value.value;
                    var checked = value.checked;
                    var vidx = newResult.indexOf(v);
                    if(checked && vidx>= 0){
                      //it is ok
                    }else if(checked && vidx < 0){
                      //add
                      newResult.push(v);
                    }else if(!checked && vidx >= 0){
                      //remove
                      newResult.splice(vidx, 1);
                    }else{// !checked && vidx < 0
                      //it is ok
                    }
                    ref.value = newResult;
                  }else{
                    ref.value = value.value;
                  }
                  
                  Aj.sync();
              } //_assign
            } // ref.changeEvents.length > 0
          } // else of (itemDef._register_assign || itemDef._assign)
          if (!itemDef._render) {
            itemDef._render = function (target, newValue) {
              var uid = Aj.util.createUID();
              target.find("input[type="+type+"]").attr("id", uid).val(valueFn(newValue));;
              target.find("label").attr("for", uid).text(textFn(newValue));
            };
          }
          break;
        }else{
          // continue to the default
        }
      default:
        throw "Only select, checkbox or radio can declare _option but found:" + target[0].outerHTML;
      }
      return Aj.createSnippet(scope, snippetRoot).bind(varRef, meta);
    };
    return op;
  }, //end optionBind

  util : {
    idSeq : 0,
    createUID : function () {
      this.idSeq++;
      return "BISD-" + this.idSeq;
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
    arraySwap : function (array, index1, index2) {
      var tmp = array[index1];
      array[index1] = array[index2];
      array[index2] = tmp;
    },
    determineRefPath : function (scope, varRef) {
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
    },
    _element_ref_map: {},
    getDataRef: function(jqueryObject, dataAttrName){
      var elementRefId = jqueryObject.attr("aj-element-ref-id");
      if(!elementRefId){
        elementRefId = Aj.util.createUID();
        jqueryObject.attr("aj-element-ref-id", elementRefId);
      }
      var refMap = Aj.util._element_ref_map[elementRefId];
      if(!refMap){
        refMap = {};
        Aj.util._element_ref_map[elementRefId] = refMap;
      }
      var dataRef = refMap[dataAttrName];
      if(!dataRef){
        dataRef = {
            _trace_id: Aj.util.createUID()
        };
        refMap[dataAttrName] = dataRef;
        console.log("create ref:" + dataRef._trace_id + " for " + jqueryObject[0].outerHTML);
      }
      return dataRef;
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
  }
};

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
  return ret;
}
Aj.form.singleCheck=function(){
  var ret = Aj.form.apply(Aj, arguments);
  ret._form._single_check = true;
  return ret;
}
