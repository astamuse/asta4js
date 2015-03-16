Aj = {

  config : {
    metaFieldDistinguisher : function (metaId, fieldName) {
      if (fieldName.indexOf("_") === 0) {
        return "_value";
      } else {
        return "_prop";
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
    var reverseMetaKeys = ["_type", "_id", "_value", "_prop"];
    return {
      rewriteMeta : function (originalMeta) {

        var meta = Aj.util.clone(originalMeta);

        //rewrite selector to extract attr operations
        var attrOpIndex = meta._selector.indexOf("@>");
        var attrOp = null;
        if (attrOpIndex >= 0) {
          attrOp = meta._selector.substr(attrOpIndex + 2);
          meta._selector = meta._selector.substring(0, attrOpIndex);
        }

        //set default 1 way binding
        if (!meta._render) {
          if (attrOp) {
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
                    if(newValue){
                      target.addClass(matched);
                    }else{
                      target.removeClass(matched);
                    }
                  };
                }
              },{
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
          } else {
            meta._render = function (target, newValue, oldValue) {
              target.text(newValue);
            };
          }
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
      },

      bindMeta : function (parentPath, originalMeta) {

        // if the user defined root meta is an array, we can bind then one by one
        if ($.isArray(originalMeta)) {
          var THIS = this;
          originalMeta.forEach(function (m) {
            THIS.bindMeta(parentPath, m)
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
        if (!meta._type) {
          meta._type = "_root";
        }

        switch (meta._type) {
        case "_root":
          //if the _value is array, we should create a new empty object to receive the moved fields from _root
          var _value_ref;
          if (!meta._value) {
            meta._value = {};
            _value_ref = meta._value;
          } else if ($.isArray(meta._value)) {
            //make sure all the _type of elements of _vlaue be "_value"
            meta._value.forEach(function (v) {
              v._type = "_value";
            });
            _value_ref = {};
            meta._value.push(_value_ref);
          } else {
            _value_ref = meta._value;
          }
          _value_ref._type = "_value";

          //the same as _value
          var _prop_ref;
          if (!meta._prop) {
            meta._prop = {};
            _prop_ref = meta._prop;
          } else if ($.isArray(meta._prop)) {
            meta._prop.forEach(function (v) {
              v._type = "_prop";
            });
            _prop_ref = {};
            meta._prop.push(_prop_ref);
          } else {
            _prop_ref = meta._prop;
          }
          _prop_ref._type = "_prop";

          var moveTargetRef = {
            _value : _value_ref,
            _prop : _prop_ref
          }
          //we need to move all the fields under root to the corresponding standard holding fields: _value or _prop

          for (var p in meta) {
            if (reverseMetaKeys.indexOf(p) >= 0) {
              continue;
            }
            var moveTarget = Aj.config.metaFieldDistinguisher(meta._id, p);
            if (moveTarget === "_value" || moveTarget === "_prop") {
              moveTargetRef[moveTarget][p] = meta[p];
              meta[p] = null;
              delete meta[p];
            } else {
              throw "metaFieldDistinguisher can only return '_value' or '_prop' rather than '" + moveTarget + "'";
            }
          }
          // now we can bind the _value and _prop one by one
          this.bindMeta(parentPath, meta._value);
          this.bindMeta(parentPath, meta._prop);
          break;
        case "_prop":
          this.bindProperty(parentPath, meta);
          break;
        case "_value":
          this.bindValue(parentPath, meta);
          break;
        default:
          throw "impossible meta type:" + meta._type;
        }
      },

      bindProperty : function (parentPath, originalMeta) {
        if (originalMeta._type !== "_prop") {
          throw "Only _prop meta can be bound to here but got:" + originalMeta._type;
        }
        for (var p in originalMeta) {
          if (reverseMetaKeys.indexOf(p) >= 0) {
            continue;
          }
          var m = originalMeta[p];
          refPath = parentPath + "." + p;
          this.bindMeta(refPath, m);
        }
      },

      bindValue : function (propertyPath, originalMeta) {
        if (originalMeta._type !== "_value") {
          throw "Only _value meta can be bound to here but got:" + originalMeta._type;
        }

        //special binding for array
        if (originalMeta._duplicator) {
          this.bindArray(propertyPath, originalMeta);
          return;
        }

        //which means there is nothing about the value to do
        if (!originalMeta._selector) {
          return;
        }

        //rewrite meta
        var meta = this.rewriteMeta(originalMeta);

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
          var currentValue = Path.get(propertyPath).getValueFrom(_scope);
          meta._render(target, currentValue, undefined);
        }

        if (meta._register_assign) {
          meta._register_assign(target, function (value) {
            meta._assign(_scope, propertyPath, value);
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

            var regularOld = Aj.util.regulateArray(oldValue);
            var regularNew = Aj.util.regulateArray(newValue);

            //we will diff the old and new and try our best to reuse the existing DOMs

            var existingNodes = _root.find("[aj-generated=" + placeHolderId + "]");

            var newLength = regularNew.length;
            var nodeLength = existingNodes.length;
            var i = 0; // loop for value
            var j = 0; // loop for node
            var insertPoint = placeHolder;

            for (; i < newLength && j < nodeLength; i++, j++) {
              var childPath = propertyPath + "[" + i + "]";
              var childElem = $(existingNodes.get(j));
              //todo retrieve the existing observer and onChange event handler

              console.log("bind childpath:" + childPath);
              console.log(childMeta);

              //recursive binding
              var childSnippet = Aj.createSnippet(_scope, childElem);
              childSnippet.bindMeta(childPath, childMeta);

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
              childSnippet.bindMeta(childPath, childMeta);

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
      } else {
        return new Array();
      }
    },
    clone : function (obj) {
      return clone(obj);
    }
  }
};
