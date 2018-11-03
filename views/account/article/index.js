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

  req.app.db.models.Article.pagedFind({
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
      res.render('account/article/index', { data: articles});
    }
  });
};


exports.detail = function(req, res, next){
  var isGotIt = "noNeed";
  req.app.db.models.Article.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(noti);
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
      res.render('account/noti/detail', { noti:result,gotBtn:isGotIt});
    }
  });


};

exports.record = function(req, res, next){
  var isGotIt = "noNeed";
  req.app.db.models.Article.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(article);
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
      res.render('account/article/record', { article:result,gotBtn:isGotIt});
    }
  });
};

exports.comment = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var comments = [];
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
    req.app.db.models.Article.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(article);
      }
      else {
        comments = result.comments;
        var commentTime = new Date();
        req.app.db.models.Account.findOne({ "phone": req.user.username }, function(err, user) {
          if (err) {
            console.log(err);
          }

          if (user) {
            comments.push({
              cBody:req.body.comment,
              cName:user.name.first,
              cTime:commentTime.getFullYear()+"年"+(commentTime.getMonth()+1)+"月"+commentTime.getDate()+"日"+commentTime.getHours()+":"+commentTime.getMinutes()+":"+commentTime.getSeconds()
            });
            var fieldsToSet = {
              comments:comments
            }
            console.log(req);
            req.app.db.models.Article.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
              if (err) {
                return workflow.emit('exception', err);
              }

              workflow.outcome.record = measurement;
              req.flash('success', '评论成功！');
              res.location('/account/article/detail/'+ req.params.id);
              res.redirect('/account/article/detail/'+ req.params.id);
            });
          }
        }); 
      }
    });
  });

  workflow.emit('validate');
};

exports.gotIt = function(req, res, next){
  let gotTime = new Date();
  var workflow = req.app.utility.workflow(req, res);
  workflow.on('validate', function() {
    workflow.emit('updateGotIt');
  });

  workflow.on('updateGotIt', function() {
    req.app.db.models.Article.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }
      if (req.xhr) {
        res.send(article);
      }
      else {
        console.log(result);
        var readers = result.readers;
        readers.forEach(function(item,index){
          if(item.username == req.user.username){
            item.isFinished = "true";
            item.fTime = gotTime.getFullYear()+"年"+(gotTime.getMonth()+1)+"月"+gotTime.getDate()+"日"+gotTime.getHours()+":"+gotTime.getMinutes()+":"+gotTime.getSeconds();

          };
        });
        result.readers = readers;
        req.app.db.models.Article.findByIdAndUpdate(req.params.id, result, function(err, measurement) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.outcome.record = measurement;
          req.flash('success', '已经阅签！');
          res.location('/account/article/detail/'+ req.params.id);
          res.redirect('/account/article/detail/'+ req.params.id);
        });
      }
    });

  });
  workflow.emit('validate');
}