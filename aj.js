Aj = {

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
    return {

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

      rewriteMeta : function (meta) {

        //set default 1 way binding
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
      },

      bindMeta : function (parentPath, meta) {
        for (var p in meta) {
          var m = meta[p];
          var refPath = null;
          if (p === "_value") { //bound to the variable root
            refPath = parentPath;
          } else {
            refPath = parentPath + "." + p;
          }
          if ($.isArray(m)) {
            for (var sm in m) {
              this.bindPropertyPath(refPath, m[sm]);
            }
          } else {
            this.bindPropertyPath(refPath, m);
          }
        }
      },

      bindPropertyPath : function (propertyPath, originalMeta) {

        //convert string to standard meta format
        var metaType = typeof originalMeta;
        var meta;
        if (metaType == "string") {
          meta = {
            _selector : originalMeta
          }
        } else if (metaType == "object") {
          meta = $.extend(true, {}, originalMeta);
        } else {
          throw "meta must be a string or object rather than " + metaType;
        }

        //special binding for array
        if (meta._duplicator) {
          this.bindArray(propertyPath, meta);
          return;
        }

        //rewrite meta
        this.rewriteMeta(meta);

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
        }

        if (meta._register_assign) {
          meta._register_assign(target, function (value) {
            meta._assign(_scope, propertyPath, value);
          });
        }
      },

      bindArray : function (propertyPath, originalMeta) {
        var meta = $.extend(true, {}, originalMeta);
        var target = _root.find(meta._duplicator);
        if (target.length == 0) {
          throw "could not find duplicator:" + meta._duplicator;
        }
                
        //we convert the array meta to a common meta by removing the mark field "_duplicator"
        meta["_duplicator"] = null;
        delete meta["_duplicator"];
        
        var THIS = this;

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
              var childMeta = $.extend(true, {}, meta);
              var childElem = $(existingNodes.get(j));
              //todo retrieve the existing observer and onChange event handler

              //recursive binding
              var childSnippet = Aj.createSnippet(_scope, childElem);
              childSnippet.bindMeta(childPath, childMeta);

              insertPoint = childElem;
            } // end i,j

            for (; i < newLength; i++) {
              var childPath = propertyPath + "[" + i + "]";
              var childMeta = $.extend(true, {}, meta);
              var childElem = $(templateStr);
              insertPoint.after(childElem);

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
  }
};
