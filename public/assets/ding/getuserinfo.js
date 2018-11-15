console.log("ding getuser info");
dd.ready(function() {
    dd.runtime.permission.requestAuthCode({
        corpId: "corpid",
        onSuccess: function(result) {
            console.log(result);
        /*{
            code: 'hYLK98jkf0m' //string authCode
        }*/ 
        },
        onFail : function(err) {}
  
    });
});