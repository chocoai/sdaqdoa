'use strict'
var wechat = require('../wechat/sendMessage');
var wechatAPP = require('../wechatAPP/sendWechat');

exports.proposeIt = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var timeNow = new Date();
  workflow.on('validate', function() {

    workflow.emit('proposeIt');
  });

workflow.on('proposeIt', function() {
    req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(article);
      }
      else {
            console.log(result);
            let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
            wechat.systemSendMessage(result.creator.username,"您提交了一条新的假条审批",general,"http://sdabj.com/account/leave/");
            wechat.systemSendMessage(result.applicantSupervisor.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/");
            wechatAPP.sendWechat(result.creator.username,"您提交了一条新的假条审批",general,"http://sdabj.com/account/leave/",1000003);
            wechatAPP.sendWechat(result.applicantSupervisor.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/",1000003);

            var fieldsToSet = {
                pUsername:result.applicantSupervisor.username,
                status:"proposing",
                applicantSupervisor:{
                    username:result.applicantSupervisor.username,
                    name:result.applicantSupervisor.name,
                    stage:result.applicantSupervisor.stage,
                    position:result.applicantSupervisor.position,
                    team:result.applicantSupervisor.team,
                    timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                    comment:"",
                    result:"proposing",
              }
            }
            req.app.db.models.Leave.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }

              workflow.outcome.record = measurement;
              req.flash('success', '提交成功！');
              res.location('/account/leave/');
              res.redirect('/account/leave/');
            });
      }
    });
  });

  workflow.emit('validate');
};

exports.disagreeIt = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var timeNow = new Date();
  workflow.on('validate', function() {

    workflow.emit('proposeIt');
  });

workflow.on('proposeIt', function() {
    req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(article);
      }
      else {
            console.log(req.user.username);
            var fieldsToSet = {};
            if(req.user.username == result.applicantSupervisor.username){//申请人主管
                fieldsToSet.pUsername="00000";
                fieldsToSet.status="denied";
                fieldsToSet.applicantSupervisor = {
                    username:result.applicantSupervisor.username,
                    name:result.applicantSupervisor.name,
                    stage:result.applicantSupervisor.stage,
                    position:result.applicantSupervisor.position,
                    team:result.applicantSupervisor.team,
                    timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                    comment:req.body.comment,
                    result:"reject",
                }
            }
            if(result.respondentSupervisor.username){
                if(req.user.username == result.respondentSupervisor.username){//被申请人主管
                    fieldsToSet.pUsername="00000";
                    fieldsToSet.status="denied";
                    fieldsToSet.respondentSupervisor = {
                        username:result.respondentSupervisor.username,
                        name:result.respondentSupervisor.name,
                        stage:result.respondentSupervisor.stage,
                        position:result.respondentSupervisor.position,
                        team:result.respondentSupervisor.team,
                        timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                        comment:req.body.comment,
                        result:"reject",
                    }
                }
            }
            
            if(req.user.username == result.manager.username){//经理
                fieldsToSet.pUsername="00000";
                fieldsToSet.status="denied";
                fieldsToSet.manager = {
                    username:result.manager.username,
                    name:result.manager.name,
                    stage:result.manager.stage,
                    position:result.manager.position,
                    team:result.manager.team,
                    timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                    comment:req.body.comment,
                    result:"reject",
                }
            }
            req.app.db.models.Leave.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }
              let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
              wechat.systemSendMessage(result.creator.username,"您的假条审批被驳回",general,"http://sdabj.com/account/leave/");
              wechatAPP.sendWechat(result.creator.username,"您的假条审批被驳回",general,"http://sdabj.com/account/leave/",1000003);
              workflow.outcome.record = measurement;
              req.flash('success', '驳回成功！');
              res.location('/account/agree/');
              res.redirect('/account/agree/');
            });
      }
    });
  });

  workflow.emit('validate');
};

exports.agreeIt = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var timeNow = new Date();
  workflow.on('validate', function() {

    workflow.emit('agreeIt');
  });

workflow.on('agreeIt', function() {
    req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(article);
      }
      else {
            console.log(req.user.username);
            var fieldsToSet = {};
            if(req.user.username == result.applicantSupervisor.username){//申请人主管同意后
                if(result.respondentSupervisor.username){//下一级有主管
                    fieldsToSet.pUsername=result.respondentSupervisor.username;
                    fieldsToSet.respondentSupervisor = {
                        username:result.respondentSupervisor.username,
                        name:result.respondentSupervisor.name,
                        stage:result.respondentSupervisor.stage,
                        position:result.respondentSupervisor.position,
                        team:result.respondentSupervisor.team,
                        timeReacted:"",
                        comment:"",
                        result:"proposing",
                    }
                    //申请人主管同意后，通知申请人和下一级主管
                    let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
                    wechat.systemSendMessage(result.creator.username,"您的假条审批通过您的主管审批",general,"http://sdabj.com/account/leave/");
                    wechat.systemSendMessage(result.respondentSupervisor.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/");
                    wechatAPP.sendWechat(result.creator.username,"您的假条审批通过您的主管审批",general,"http://sdabj.com/account/leave/",1000003);
                    wechatAPP.sendWechat(result.respondentSupervisor.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/",1000003);
                }else{//下一级为经理
                    fieldsToSet.pUsername=result.manager.username;
                    fieldsToSet.manager = {
                        username:result.manager.username,
                        name:result.manager.name,
                        stage:result.manager.stage,
                        position:result.manager.position,
                        team:result.manager.team,
                        timeReacted:"",
                        comment:"",
                        result:"proposing",
                    }
                    //申请人主管同意后，通知申请人和经理
                    let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
                    wechat.systemSendMessage(result.creator.username,"您的假条审批通过您的主管审批",general,"http://sdabj.com/account/leave/");
                    wechat.systemSendMessage(result.manager.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/");
                    wechatAPP.sendWechat(result.creator.username,"您的假条审批通过您的主管审批",general,"http://sdabj.com/account/leave/",1000003);
                    wechatAPP.sendWechat(result.manager.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/",1000003);
                }
                fieldsToSet.status="proposing";
                fieldsToSet.applicantSupervisor = {
                    username:result.applicantSupervisor.username,
                    name:result.applicantSupervisor.name,
                    stage:result.applicantSupervisor.stage,
                    position:result.applicantSupervisor.position,
                    team:result.applicantSupervisor.team,
                    timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                    comment:req.body.comment,
                    result:"pass",
                }
            }
            if(result.respondentSupervisor.username){
                if(req.user.username == result.respondentSupervisor.username){//被申请人主管
                    fieldsToSet.pUsername=result.manager.username;
                    fieldsToSet.manager = {
                        username:result.manager.username,
                        name:result.manager.name,
                        stage:result.manager.stage,
                        position:result.manager.position,
                        team:result.manager.team,
                        timeReacted:"",
                        comment:"",
                        result:"proposing",
                    }
                    //被申请人主管同意后，通知申请人和经理
                    let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
                    wechat.systemSendMessage(result.creator.username,"您的假条审批通过被申请人主管审批",general,"http://sdabj.com/account/leave/");
                    wechat.systemSendMessage(result.manager.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/");
                    wechatAPP.sendWechat(result.creator.username,"您的假条审批通过被申请人主管审批",general,"http://sdabj.com/account/leave/",1000003);
                    wechatAPP.sendWechat(result.manager.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/",1000003);
                    fieldsToSet.status="proposing";
                    fieldsToSet.respondentSupervisor = {
                        username:result.respondentSupervisor.username,
                        name:result.respondentSupervisor.name,
                        stage:result.respondentSupervisor.stage,
                        position:result.respondentSupervisor.position,
                        team:result.respondentSupervisor.team,
                        timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                        comment:req.body.comment,
                        result:"pass",
                    }
                }
            }
            
            if(req.user.username == result.manager.username){//经理
                fieldsToSet.pUsername="00000";
                fieldsToSet.status="passed";
                fieldsToSet.manager = {
                    username:result.manager.username,
                    name:result.manager.name,
                    stage:result.manager.stage,
                    position:result.manager.position,
                    team:result.manager.team,
                    timeReacted:timeNow.getFullYear()+"年"+(timeNow.getMonth()+1)+"月"+timeNow.getDate()+"日"+timeNow.getHours()+":"+timeNow.getMinutes()+":"+timeNow.getSeconds(),
                    comment:req.body.comment,
                    result:"pass",
                }
                //经理审批通过后，通知申请人
                let general = result.creator.name + "申请的" + result.startDate + "至" + result.endDate + "的请假条";
                wechat.systemSendMessage(result.creator.username,"您的假条审批通过了",general,"http://sdabj.com/account/leave/");
                wechatAPP.sendWechat(result.creator.username,"您的假条审批通过了",general,"http://sdabj.com/account/leave/",1000003);
                if(result.respondent){
                  wechat.systemSendMessage(result.respondent.username,"有与您相关的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/");
                  wechatAPP.sendWechat(result.respondent.username,"有与您相关的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/",1000003);
                }
                wechat.systemSendMessage("013569","有新的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/");
                wechat.systemSendMessage("012358","有新的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/");
                wechatAPP.sendWechat("013569","有新的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/",1000003);
                wechatAPP.sendWechat("012358","有新的假条审批通过了",general,"http://sdabj.com/account/allLeaves/passed/",1000003);
            }
            req.app.db.models.Leave.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }
              workflow.outcome.record = measurement;
              req.flash('success', '审批通过成功！');
              res.location('/account/agree/');
              res.redirect('/account/agree/');
            });
      }
    });
  });

  workflow.emit('validate');
};