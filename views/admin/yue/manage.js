'use strict'

exports.findall = function(req, res, next){
        req.query.name = req.query.name ? req.query.name : '';
        req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
        req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
        req.query.sort = req.query.sort ? req.query.sort : 'timeFinished';

        var filters = {};
        if (req.query.username) {
            filters.title = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
        }

        req.app.db.models.Yue.pagedFind({
            filters: filters,
            keys: 'title general creator isImportant timeFinished type',
            limit: req.query.limit,
            page: req.query.page,
            sort: req.query.sort
        }, function(err, results) {
            if (err) {
            return next(err);
            }

            if (req.xhr) {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            results.filters = req.query;
            res.send(results);
            }
            else {
            results.filters = req.query;
            res.render('admin/yue/manage', { data: results.data.reverse() });
            }
        });
};

exports.delete = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

    workflow.emit('deleteAccount');
    });

    workflow.on('deleteAccount', function(err) {
    req.app.db.models.Yue.findByIdAndRemove(req.params.id, function(err, admin) {
        if (err) {
        return workflow.emit('exception', err);
        }
        req.flash('success','删除了通知');
        res.location('/admin/yue/manage/');
        res.redirect('/admin/yue/manage/');
    });
    });

    workflow.emit('validate');
}