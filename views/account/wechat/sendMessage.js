var wechat = require('wechat-enterprise');
var express = require('express');
var API = wechat.API;
var leaveApi = new API('wxf01fb15a9cbdef24', 'AU2gpQG0Ui_9P1dFdAgYMnnHMzmA0YsA859X8mkArFMgKCFOby-BF3busxniltMa', '28');
var wechatconfig = {
  token: 'sdabjoa',
  encodingAESKey: 'dX7eoxCZxsRN2xTyWv89CcgP1n60eTabUJawr2a4xTL',
  corpId: 'wxf01fb15a9cbdef24'
};
var app = express();
app.use('/corp', wechat(wechatconfig, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

exports.sendMessage = function(req, res, next){
    console.log(req.params.id);
    console.log("send wechat notifications");
    req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
            if (err) {
                return next(err);
            }
            if (req.xhr) {
                res.send(article);
            }else {
                var username = result.pUsername;
                var general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
                console.log(username);
                sendWechatMessage(username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/");
                req.flash('success','微信通知成功');
                res.location('/account/leave/');
                res.redirect('/account/leave/');
            }
        });
}

exports.testSendMessage = function(req, res, next){
    sendWechatMessage("012358","您有一条新的假条需要审批","测试概论","http://sdabj.com/account/agree/");
    req.flash('success','微信通知成功');
    res.location('/account/leave/');
    res.redirect('/account/leave/');
}

exports.systemSendMessage = function(toWho,title,general,url){
    sendWechatMessage(toWho,title,general,url);
}

function sendWechatMessage(toWho,title,description,url){
    var to = {
        "touser":toWho
    };
    var message = {
        "msgtype": "news",
        "news": {
        "articles":[
            {
            "title": title,
            "description": description,
            "url": url,
            "picurl": "http://sdabj.com/media/agree.jpg",
            }
        ]
        },
        "safe":"0"
    };

    var call = function(){
        console.log("请假审批代办微信发送成功！")
    };
    leaveApi.send(to, message,call);
}