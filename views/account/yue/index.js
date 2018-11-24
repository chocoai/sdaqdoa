
'use strict'

exports.findmy = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  if (req.query.username) {
    filters.title = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  }
  var date = new Date();
  date = returnDateString(date);

  filters.timeFinished = {"$gte" : date};

  req.app.db.models.Yue.pagedFind({
    filters: filters,
    keys: 'title general creator isImportant timeFinished type readers',
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
      //console.log(articles);
      articles.forEach(function(article,i,articles){
        var need = false;
        var gotit = true;
        if(article.readers.findIndex(function(element,j,array){return element.id == req.user.username;}) != -1){
          need = true;
          var reader = article.readers.find(function(element,j,array){return element.id == req.user.username;});
          if(reader.isFinished == false){
            gotit = false;
          }
        }
        
        articles[i].need = need;
        articles[i].gotit = gotit;
      });
      res.render('account/yue/index', { data: articles});
    }
  });
};


exports.detail = function(req, res, next){
  var need = false;
  var gotit = true;
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
      //console.log(result.readers);
      if(result.readers.findIndex(function(element,index,array){return element.id == req.user.username;}) != -1){
        need =true;
        var reader = result.readers.find(function(element,index,array){return element.id == req.user.username;});
        //console.log(reader);
        if(!reader.isFinished){
          gotit = false;
        }
      }
      res.render('account/yue/detail', { yue:result,teams:teams,need:need,gotit:gotit});
    }
  });
};


exports.comment= function(req, res, next){
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
              res.location('/account/yue/detail/'+ req.params.id);
              res.redirect('/account/yue/detail/'+ req.params.id);
            });
          }

      }
    });
  });

  workflow.emit('validate');
};

exports.gotit= function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var readers = [];
  //console.log(req.user);
  
  workflow.on('validate', function() {

    workflow.emit('gotit');
  });

    workflow.on('gotit', function() {
    if(req.body.comment == ""){req.body.comment = "已阅"}
    req.app.db.models.Yue.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }

      if (req.xhr) {
        res.send(yue);
      }
      else {
        readers = result.readers;
        //console.log(readers);
        var commentTime = new Date();
        //console.log(req.user);
        var req_user = readers.findIndex(function(element,index,array){return element.id == req.user.username;});
        //console.log(readers[req_user]);
        readers[req_user].isFinished = true;
        readers[req_user].fb = req.body.comment;
        var fieldsToSet = {
          readers:readers
        }
        req.app.db.models.Yue.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
          if (err) {
            return workflow.emit('exception', err);
          }

        workflow.outcome.record = measurement;
        res.location('/account/yue/detail/'+ req.params.id);
        res.redirect('/account/yue/detail/'+ req.params.id);
        // res.location('/account/yue/');
        // res.redirect('/account/yue/');
          // if (req.user && req.body.gotit ) {
          //   readers.push({
          //     cBody:req.body.gotit,
          //     cName:req.user.name,
          //     cAvatar:req.user.avatar,
          //     cTime:commentTime.getFullYear()+"年"+(commentTime.getMonth()+1)+"月"+commentTime.getDate()+"日"+commentTime.getHours()+":"+commentTime.getMinutes()+":"+commentTime.getSeconds()
          //   });

            
               
            });
          // }

      }
    });
  });

  workflow.emit('validate');
};

function returnDateString(date){
  //console.log("return " + date);
  var dateString = "";
  if(date.getMonth()<9){
    dateString = date.getFullYear()+"-0"+(date.getMonth()+1);
  }
  if(date.getMonth()>= 9 ){
    dateString = date.getFullYear()+"-"+(date.getMonth()+1);
  }
  if(date.getDate()<=9){
    dateString = dateString+"-0"+(date.getDate());
  }
  if(date.getDate()> 9 ){
    dateString = dateString+"-"+(date.getDate());
  }
  return dateString;
}