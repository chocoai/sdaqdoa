'use strict'

exports.delete = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
    workflow.emit('deleteLeave');
    });

    workflow.on('deleteLeave', function(err) {
    req.app.db.models.Leave.findByIdAndRemove(req.params.id, function(err, account) {
        if (err) {
        return workflow.emit('exception', err);
        }
        req.flash('success','删除了请假条');
        res.location('/account/leave/');
        res.redirect('/account/leave/');
    });
    });

    workflow.emit('validate');
}