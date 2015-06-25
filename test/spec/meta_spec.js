"use strict";

var metaApi = require("../../src/meta.js")

var fn1 = function(){};
var fn2 = function(){};
    
describe('meta merge test', function () {
  it("simplest meta merge", function() {
    

    
    var m1 = {
      p1: {
        _selector: "",
        _render: fn1,
        p2 : "bb"
      },
      a: ""
    };
    var m2 = {
      p1 :{
        x: "xx",
        p2: "pp"
      },
      u: {
        k: "ds"
      }
    }
    
    metaApi.mergeMeta(m1, m2);
    
    expect(m2).toEqual({
      p1 :{
        _selector: "",
        _render: fn1,
        x: "xx",
        p2:[ "pp", "bb" ]
      },
      u: {
        k: "ds"
      },
      a: ""
    });
  });
  
  it("meta merged to array on conflict properties", function() {
    
    var fn = function(){};
    
    var m1 = {
      p1: {
        _selector: "ps1",
        _render: fn1,
        p2 : "bb"
      }
    };
    var m2 = {
      p1 :{
        _selector: "ps2",
        _render: fn2,
        x: "xx",
        p2: "pp"
      },
      u: {
        k: "ds"
      }
    }
    
    metaApi.mergeMeta(m1, m2);
    
    expect(m2).toEqual({
      p1 :{
        _selector: ["ps2", "ps1"],
        _render: [fn2, fn1],
        x: "xx",
        p2:[ "pp", "bb" ]
      },
      u: {
        k: "ds"
      }
    });
  });
  
  it("merge meta by predefined array to avoid conflict ", function() {
    
    var fn = function(){};
    
    var m1 = {
      p1: [{
        _selector: "ps1",
        _render: fn1,
        p2 : "bb"
      }]
    };
    var m2 = {
      p1 :{
        _selector: "ps2",
        _render: fn2,
        x: "xx",
        p2: "pp"
      },
      u: {
        k: "ds"
      }
    }
    
    metaApi.mergeMeta(m1, m2);
    
    expect(m2).toEqual({
      p1 :[
        {
          _selector: "ps2",
          _render: fn2,
          x: "xx",
          p2: "pp"
        },
        {
          _selector: "ps1",
          _render: fn1,
          p2 : "bb"
        }
      ],
      u: {
        k: "ds"
      }
    });
  });
});