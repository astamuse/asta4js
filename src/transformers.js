"use strict";

var util = require("./util");

var _int = {
  setValue: function(v){
    var nv = parseInt(v, this._radix);
    if(isNaN(nv)){
      return v;
    }else{
      return nv;
    }
  },
  getValue: function(v){
    return (v).toString(this._radix);
  }
}

var _float = {
  setValue: function(v){
    var nv = parseFloat(v);
    if(isNaN(nv)){
      return v;
    }else{
      return nv;
    }
  },
  getValue: function(v){
    return (v).toString();
  }
}

module.exports={
  "int": function(radix){
    var ret = util.shallowCopy(_int);
    ret._radix = radix ? radix : 10;
    return ret;
  },
  "float": function(){
    return util.shallowCopy(_float);
  },
  "date": {
    
  }
}

