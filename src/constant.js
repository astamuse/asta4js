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


module.exports = constant;