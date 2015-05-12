"use strict";

var ValueMonitor = require("../../src/value-monitor.js")

describe('value-monitor test', function () {
  
  it("value ref set value should works", function() {
    var scope = {
      data: {}
    };
    var monitor = new ValueMonitor(scope, "data");
    
    var vr = monitor.getValueRef("pp");
    
    expect(vr.getValue()).toBe(undefined);
    
    vr.setValue("GGG");
    
    expect(vr.getValue()).toBe("GGG");
  });
  
  it("value ref set value should works on recursive path which is not initialized ", function() {
    var scope = {
      data: {}
    };
    var monitor = new ValueMonitor(scope, "data");
    
    var vr = monitor.getValueRef("pp.xx");
    
    expect(vr.getValue()).toBe(undefined);
    
    vr.setValue("GGG");
    
    expect(vr.getValue()).toBe("GGG");
  });
  
});