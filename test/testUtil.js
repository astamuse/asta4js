module.exports.getValueOfCR=function(page, selector, callback){
  //var elemIds = [];
  var retVals = [];
  page.elements(selector, function(err, ret){
    if(err){
      callback(err);
      return;
    }
    ret.value.forEach(function(r){
      var id = r.ELEMENT;
      page.elementIdAttribute(id, "checked", function(err,ck){
        if(err){
          callback(err);
          return;
        }
        if(ck.value){
          page.elementIdAttribute(id, "value", function(err, r){
            if(err){
              callback(err);
              return;
            }
            retVals.push(r.value);
          });
        }
      });
    });
  });
  //fake operation to arrange the callback
  page.status(function(err, status){
    callback(null, retVals);
  });
}

module.exports.clickCheckBoxLabel=function(page, inputSelector){
    var checkBoxId;
    page.getAttribute(inputSelector, "id", function(err, id){
      checkBoxId = id;
    });
    page.status(function(){
      page.click("label[for="+checkBoxId+"]");;
    })
}
