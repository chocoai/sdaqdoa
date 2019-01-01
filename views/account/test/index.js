'use strict'
//var wechat = require('../wechat/sendMessage');
var wechatAPP = require('../wechatAPP/sendWechat');

exports.index = function(req, res, next){
    req.flash('danger', '仅测试使用，其他人员不要随意使用！');
    res.location('/account/test/');
    res.render('account/test/index');
    req.flash('danger', '仅测试使用，其他人员不要随意使用！');
};

exports.wechatCrop= function(req, res, next){
    console.log("企业号推送一条消息");
    var txt = req.body.txt;
    var id = req.body.id;
    var data = {
        "touser" : "012358",
        "msgtype" : "textcard",
        "agentid" : 1000003,
        "textcard" : {
                    "title" : "您提交了一条新的假条审批",
                    "description" : "<div class=\"gray\">"+"2017.05.21"+"</div> <div class=\"normal\">您提交了一条新的假条审批</div><div class=\"highlight\">请关注请假条审批进度</div>",
                    "url" : "http://sdabj.com/account/leave/"
        }
    };
    wechatAPP.sendWechat(data);
    req.flash('success', '提交成功！');
    res.location('/account/test/');
    res.render('account/test/index');
};