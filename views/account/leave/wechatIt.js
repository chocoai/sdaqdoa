'use strict'

exports.wechatIt = function(req, res, next){
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