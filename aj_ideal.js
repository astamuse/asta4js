/*

What we want to do here seems amazing but also seems impossible since there is no way
to retrieve the original variable names of calling the bind function.

*/
$(function(){
  
  var data={
    
  };
  
  Aj.snippet("head")
    .bind("title", data.title);

  Aj.snippet("#content")
    .bind("[name=name]", "value", data.name)
    .bind("#list1 li", data.list)
    .bind("#list2 li", data.list, function(item){
      return Aj.bind(".x-seq", item.index)
               .bind(".x-item-yaz", item.item.yaz);
    });
    
  Aj.snippet("#operation")
    .bind("#doSomeThing", "onclick", function(){
      data.title = "xxx";
      data.name = "yyy";
      data.list = ["aa", "bb", "cc"];
      data.list2 = ["AA", "BB", "CC"];
    });
  
  //the following may be more js-like but it is exactly more confusing

  Aj.snippet("#content")
    .bind({
      "[name=name]": {"value", data.name},
      "#list1 li"  : data.list,
      "#list2 li"  : {
          data.list  : function(item, index){
            return {
                  ".x-seq"     : index,
                  ".x-item-yaz": item.yaz
                 };
          }
      };
    });
    
  Aj.snippet("#operation")
    .bind({
      "#doSomeThing": {
        "onclick": function(){
          data.title = "xxx";
          data.name = "yyy";
          data.list = ["aa", "bb", "cc"];
          data.list2 = ["AA", "BB", "CC"];
        }
      }
    });

  
});

Aj = {
  snippet: function(selector){
    return this;
  },
  bind: function(selector, varRef){
    /*
    //for
    var callee = arguments.callee;
    var caller = arguments.caller;
    console.log(calleed.callerxxx);
    */
    console.log(arguments.callee.caller.toString());
    try{
      var x = notexistbject.fs;
    }catch(e){
      console.log(e);
    }
    return this;
  }
};