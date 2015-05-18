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
    if(v){
      return (v).toString(this._radix);
    }else{
      return v;
    }
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
    if(v){
      return (v).toString(this._radix);
    }else{
      return v;
    }
  }
}

var pad = function(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
};

var toISOString = function(date, keepMs, keepZ) {
  var s = date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()) +
    'T' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes()) +
    ':' + pad(date.getUTCSeconds());
  
  if(keepMs){
    s += '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
  }
  
  if(keepZ){
    s += 'Z';
  }
  
  return s;
};

var _datetime = {
  //default tz is UTC or the given parse value is with tz information
  _parse_tz_offset : 0,
  //default tz is UTC
  _stringy_tz_offset: 0,
  //default to remove the tail z in stringified iso string
  _stringy_as_local : true,
  //default to remove tail milliseconds value
  _stringy_keep_ms : false,
  setValue : function(v){
    var time = Date.parse(v);
    if(isNaN(time)){
      return v;
    }else{
      time = time + this._parse_tz_offset;
      return new Date(time);
    }
  },
  getValue : function(v){
    if(v && v.toISOString && v.getTime){//is a date
      if(this._stringy_as_local){
        var d = new Date(v.getTime());
        if(this._stringy_tz_offset !== 0){
          d.setTime(d.getTime() - this._stringy_tz_offset);
        }
        return toISOString(d, this._stringy_keep_ms, !this._stringy_as_local);
      }else{
        return v.toISOString();
      }
    }else{
      return v;
    }
    
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
  "datetime": function(option){
    var ret = util.shallowCopy(_datetime);
    if(option){
      return util.shallowCopy(option, ret);
    }else{
      return ret;
    }
    
  }
}

