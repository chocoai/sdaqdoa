'use strict'

exports.finishIt = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var timeNow = new Date();
  workflow.on('validate', function() {

    workflow.emit('finishIt');
  });

workflow.on('finishIt', function() {
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
                status:"finished"
            }
            if(result.status == "passed"){
                req.app.db.models.Leave.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }
                    workflow.outcome.record = measurement;
                    req.flash('success', '销假成功！');
                    res.location('/account/leave/');
                    res.redirect('/account/leave/');
                });
            }
            
      }
    });
  });

  workflow.emit('validate');
};