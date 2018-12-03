'use strict'
var Ding = require('./ding/ding.js');
var moment = require('moment');

exports.findall = function(req, res, next){
        req.query.name = req.query.name ? req.query.name : '';
        req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
        req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
        req.query.sort = req.query.sort ? req.query.sort : '-_id';

        var filters = {};
        if (req.query.username) {
            filters.title = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
        }

        req.app.db.models.Yue.pagedFind({
            filters: filters,
            keys: 'title general creator isImportant timeFinished type end',
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
            res.render('admin/yue/manage', { data: results.data});
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

exports.finish = function(req, res, next){
    console.log("修改一个新通知");
    console.log(req.params.id);
    var workflow = req.app.utility.workflow(req, res);
  
    workflow.on('validate', function() {
        var fieldsToSet = {
            end:true,
        };
        
        req.app.db.models.Yue.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, yue) {
            if (err) {
                return workflow.emit('exception', err);
            }
        
            workflow.outcome.record = yue;
            console.log(yue);
            req.flash('success','通知修改成功');
            res.location('/admin/yue/manage/');
            res.redirect('/admin/yue/manage/');
        });
    });
    workflow.emit('validate');
}

exports.open = function(req, res, next){
    console.log("修改一个新通知");
    console.log(req.params.id);
    var workflow = req.app.utility.workflow(req, res);
  
    workflow.on('validate', function() {
        var fieldsToSet = {
            end:false,
        };
        
        req.app.db.models.Yue.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, yue) {
            if (err) {
                return workflow.emit('exception', err);
            }
        
            workflow.outcome.record = yue;
            console.log(yue);
            req.flash('success','通知修改成功');
            res.location('/admin/yue/manage/');
            res.redirect('/admin/yue/manage/');
        });
    });
    workflow.emit('validate');
}

exports.dailyPlan1 = function(app){//每天定时通知未阅签人员
    //console.log("test");

    var filters = {};
    filters.end = false;

    app.db.models.Yue.pagedFind({
        filters: filters,
        keys: 'title general timeFinished type end readers',
        limit: 100,
        page: 1,
        sort: "timeFinished"
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        else {
        //console.log(results.data);
        results.data.forEach(function(yue,i,yues){
            var readers = yue.readers;
            //console.log(readers);
            var usernames = "";
            //console.log(readers);
            readers.forEach(reader => {
                if(!reader.isFinished){
                    usernames += reader.id + ",";
                }
            });
            //console.log("拼接后的用户"+usernames);
            Ding.ding(usernames,"您有阅签尚未完成阅签，请点击进入及时完成","http://sdaoa.com:8088/account/yue/");
        });
        //res.render('admin/yue/manage', { data: results.data.reverse() });
        }
    });
}

exports.dailyPlan2 = function(app){//每天定时关闭阅签
    var filters = {};
    var timeCreate = new Date();
    var fieldsToSet = {
        end:true,
    };

    filters.end = false;

    app.db.models.Yue.pagedFind({
        filters: filters,
        keys: 'title general timeFinished type end readers',
        limit: 100,
        page: 1,
        sort: "timeFinished"
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        else {
            //console.log(results.data);
            results.data.forEach(function(yue,i,yues){
                var now = moment();
                //console.log(now);
                var yueTime = moment(yue.timeFinished);
                //console.log(yueTime);
                if(now > yueTime){
                    console.log('关闭'+yue.title);
                    app.db.models.Yue.findByIdAndUpdate(yue._id, fieldsToSet, function(err, yue) {
                        if (err) {
                            console.log('exception'+ err);
                        }
                        //console.log(yue);
                    });
                }
            });
        //res.render('admin/yue/manage', { data: results.data.reverse() });
        }
    });
}