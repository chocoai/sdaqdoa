'use strict'

exports.findall = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  if (req.query.username) {
    filters.title = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  }

  req.app.db.models.Yue.pagedFind({
    filters: filters,
    keys: 'title general creator isImportant timeFinished',
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
      var articles = results.data.reverse();
      res.render('admin/yue/index', { data: articles});
    }
  });
};


exports.detail = function(req, res, next){
  req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(yue);
    }
    else {
      var readers = result.readers;
      var teams = [];
      //console.log(readers);
      readers.forEach(function(reader,i,readers){
        if(teams.indexOf(reader.team) == -1){
          teams.push(reader.team);
        }
      });
      //console.log(teams);
      console.log(result);
      res.render('admin/yue/detail', { yue:result,teams:teams});
    }
  });
};

exports.export = function(req, res, next){
  req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(yue);
    }
    else {
      var readers = result.readers;
      var teams = [];
      //console.log(readers);
      readers.forEach(function(reader,i,readers){
        if(teams.indexOf(reader.team) == -1){
          teams.push(reader.team);
        }
      });
      //console.log(teams);
      console.log(result);
      res.render('admin/yue/export', { yue:result,teams:teams});
    }
  });
};

exports.record = function(req, res, next){
  var isGotIt = "noNeed";
  req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(yue);
    }
    else {
      var readers = result.readers;
      readers.forEach(function(item,index){
        if(item.username == req.user.username){
          isGotIt = "need";
          if(item.isFinished == true){
            isGotIt = "gotIt";
            console.log("gotIt");
          }
        };
      });
      console.log(result);
      res.render('admin/yue/record', { yue:result,gotBtn:isGotIt});
    }
  });
};

exports.commentbyreaders = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var commentsByReaders = [];
  console.log(req.user);
  var defaultUser = {
    name:{
      first:"匿名"
    }
  }
  
  workflow.on('validate', function() {

    workflow.emit('addComment');
  });

    workflow.on('addComment', function() {
    if(req.body.comment == ""){req.body.comment = "评论为空"}
    req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(yue);
      }
      else {
        commentsByReaders = result.commentsByReaders;
        var commentTime = new Date();
        console.log(req.user);
          if (req.user && req.body.comment ) {
            commentsByReaders.push({
              cBody:req.body.comment,
              cName:req.user.name,
              cAvatar:req.user.avatar,
              cTime:commentTime.getFullYear()+"年"+(commentTime.getMonth()+1)+"月"+commentTime.getDate()+"日"+commentTime.getHours()+":"+commentTime.getMinutes()+":"+commentTime.getSeconds()
            });
            var fieldsToSet = {
              commentsByReaders:commentsByReaders
            }
            
            req.app.db.models.Yue.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }

              workflow.outcome.record = measurement;
              req.flash('success', '增加备注评论成功！');
              res.location('/admin/yue/detail/'+ req.params.id);
              res.redirect('/admin/yue/detail/'+ req.params.id);
            });
          }

      }
    });
  });

  workflow.emit('validate');
};

exports.comment = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var comments = [];
  console.log(req.user);
  var defaultUser = {
    name:{
      first:"匿名"
    }
  }
  
  workflow.on('validate', function() {

    workflow.emit('addComment');
  });

    workflow.on('addComment', function() {
    if(req.body.comment == ""){req.body.comment = "评论为空"}
    req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(yue);
      }
      else {
        comments = result.comments;
        var commentTime = new Date();
        console.log(req.user);
          if (req.user && req.body.comment ) {
            comments.push({
              cBody:req.body.comment,
              cName:req.user.name,
              cAvatar:req.user.avatar,
              cTime:commentTime.getFullYear()+"年"+(commentTime.getMonth()+1)+"月"+commentTime.getDate()+"日"+commentTime.getHours()+":"+commentTime.getMinutes()+":"+commentTime.getSeconds()
            });
            var fieldsToSet = {
              comments:comments
            }
            
            req.app.db.models.Yue.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }

              workflow.outcome.record = measurement;
              req.flash('success', '增加备注评论成功！');
              res.location('/admin/yue/detail/'+ req.params.id);
              res.redirect('/admin/yue/detail/'+ req.params.id);
            });
          }

      }
    });
  });

  workflow.emit('validate');
};