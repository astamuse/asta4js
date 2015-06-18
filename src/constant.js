"use strict";

var constant={};

constant.metaRewritterPriority={
  _nest:  10000, 
  _watch: 20000,
  _form : 30000,
  _duplicator: 40000,
  _selector : 50000,
  _attr_op : 60000,
  _selector_after_attr_op : 65000,
  _render : 70000,
  _register_dom_change: 80000,
  _on_change: 90000,
  _assign : 100000
};

constant.impossibleSearchKey = "aj-impossible-search-key-ashfdpnasvdnoaisdfn3423#$%$#$%0as8d23nalsfdasdf";


module.exports = constant;