"use strict";

var RefPath=function(path){
  this.path = path;
}

RefPath.api=function(path){
  return new RefPath(path);
}

module.exports = RefPath;