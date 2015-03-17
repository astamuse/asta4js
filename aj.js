Aj = {

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
        for (k in this.metaFieldRewritter) {
          var def = this.metaFieldRewritter[k];
          var _priority = null;
          var _fn = null;
          if(typeof def === "object"){
            _priority = def.priority;
            _fn = def.fn;
          }else{
            _priority = 100;
            _fn = def;
          }
          array.push({
            key : k,
            fn : _fn,
            priority: _priority 
          });
        } //end k loop
        //order the array
        array.sort(function (a, b) {
          if(a.priority === b.priority){
            return a.key.localeCompare(b.key);
          }else{
            return a.priority - b.priority;
          }
        });
        this._ordered_metaFieldRewritter = array;
      }
    },
    metaFieldRewritter : {
      _form : function (meta) {
        var formDef = meta._form;
        if (typeof formDef === "string") {
          formDef = {
            name : formDef
          };
        }

        if (!meta._selector) {
          meta._selector = "[name=" + formDef.name + "]";
        }

        if (!meta._render) {
          meta._render = function (target, newValue, oldValue) {
            //TODO we need to do more for select/checkbox/radio
            target.val(newValue);
          }
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
              target.bind(changeEvents.join(" "), function () {
                var v = $(this).val();
                onChange(v);
              });
            }
          };
        }

      },
      _watch : function () {},
      _selector : {
        priority: 10000000-1, // a little smaller than bigger
        fn: function (meta) {
          if(meta._selector){// when(why) is it undefined?
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
        priority: 10000000, // bigger than bigger
        fn: function (meta) {
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
    Platform.performMicrotaskCheckpoint();
  },

  obs : new Array(),

  init : function (init_func) {
    init_func(Aj.createScope());
  },

  createScope : function () {
    return {
      snippet : function (selector) {
        return Aj.createSnippet(this, $(selector));
      }
    };
  },

  createSnippet : function (_scope, _root) {
    var reverseMetaKeys = ["_meta_type", "_meta_id", "_value", "_prop"];
    return {
      rewriteMeta : function (originalMeta) {

        var meta = Aj.util.clone(originalMeta);



        //now we will call the registered meta rewritter to rewrite the meta
        Aj.config._order_metaFieldRewritter();
        console.log(Aj.config._ordered_metaFieldRewritter);
        Aj.config._ordered_metaFieldRewritter.forEach(function (mr) {
          if (meta[mr.key] !== undefined) {
            mr.fn(meta);
            if(mr.key !== "_selector"){
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
        //find out the ref path at first
        var searchKey = "ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";
        varRef[searchKey] = 1;

        var refPath = null;
        for (var p in _scope) {
          var ref = _scope[p];
          if (ref[searchKey] == 1) {
            refPath = p;
            break;
          }
        }

        varRef[searchKey] = null;
        delete varRef[searchKey];

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
        meta = this.rewriteMeta(meta);

        //which means there is nothing about the value to do
        if (!meta._selector) {
          return;
        }

        //retrieve target
        var target = _root.find(meta._selector);
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
          });
          var currentValue = null;
          if (propertyPath === "_index") {
            currentValue = arrayIndex;
          } else {
            currentValue = Path.get(propertyPath).getValueFrom(_scope);
          }
          meta._render(target, currentValue, undefined);
        }

        if (meta._register_assign) {
          meta._register_assign(target, function (value) {
            meta._assign(_scope, propertyPath, value);
            Aj.sync();
          });
        }
      },

      bindArray : function (propertyPath, originalMeta) {
        var target = _root.find(originalMeta._duplicator);
        if (target.length == 0) {
          throw "could not find duplicator:" + originalMeta._duplicator;
        }

        var THIS = this;
        var childMeta = Aj.util.clone(originalMeta["_item"]);

        target.each(function (index, elem) {

          //create placle holder
          var tagName = elem.tagName;
          var placeHolderId = Aj.util.createUID();
          var placeHolder = $("<" + tagName + " style='display:none' id='" + placeHolderId + "'/>");
          var $elem = $(elem);
          $elem.after(placeHolder);

          //remove the duplicate target
          $elem.remove();
          $elem.attr("aj-generated", placeHolderId);

          var templateStr = $("<div>").append($elem).html();
          console.log(templateStr);

          var observer = new PathObserver(_scope, propertyPath);
          observer.open(function (newValue, oldValue) {
            console.log("from");
            console.log(oldValue);
            console.log("to");
            console.log(newValue);

            /*
             * we should monitor the array splicing
             */
            if ($.isArray(newValue)) { // only when the new value is not undefined/null
              var splicingObserver = new ArrayObserver(newValue);
              splicingObserver.open(function (splices) {
                var removedCount = 0;
                var addedCount = 0;

                splices.forEach(function (s) {
                  removedCount += s.removed.length;
                  addedCount += s.addedCount;
                });

                var diff = addedCount - removedCount;

                var existingNodes = _root.find("[aj-generated=" + placeHolderId + "]");
                var existingLength = existingNodes.length;

                if (diff > 0) {
                  //we simply add the new child to the last of current children list,
                  //all the values will be synchronized correctly since we bind them
                  //by a string value path rather than the real object reference.
                  var insertPoint = $(existingNodes.get(existingLength - 1)); // the last one as insert point
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
              });
            }

            /*
             * following is for value assigning by whole array instance
             */
            var existingNodes = _root.find("[aj-generated=" + placeHolderId + "]");

            var regularOld = Aj.util.regulateArray(oldValue);
            var regularNew = Aj.util.regulateArray(newValue);

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

          }); //observer.open

        }); //target.each
      }, //bindArray


      discard : function () {
        //TODO
      },

      on : function (event, selector, fn) {
        _root.on(event, selector, fn);
        Aj.sync();
        return this;
      }

    } //return snippet
  }, //create snippet

  util : {
    idSeq : 0,
    createUID : function () {
      return "BISD-" + this.idSeq;
    },
    regulateArray : function (v) {
      if ($.isArray(v)) {
        return v;
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
    }
  }
};
