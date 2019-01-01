var ding = require('./ding/ding.js');
var moment = require('moment');
exports.add = function(req, res, next){
  req.query.username = req.query.username ? req.query.username : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '-_id';

  var filters = {};
  filters.source = "dingding";
  
  req.app.db.models.User.pagedFind({
    filters: filters,
    keys: 'username email isActive name department_name',
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
      //console.log(results.data);
      var teamLists = [];
      var userLists = [];
      var users = results.data;
      results.data.forEach(function(person,i,persons){
        //console.log(person.department_name);
        //console.log(teamLists.indexOf(person.department_name));
        if(teamLists.indexOf(person.department_name) == -1){
          teamLists.push(person.department_name);
        }
      });
      //console.log(teamLists);
      teamLists.forEach(function(team,i,teams){
        userLists.push({
          team:team,
          userList:users.filter(function(user){return user.department_name == team})
        });
      });
      //console.log(userLists);
      var now = moment().add(7, 'days');
      res.render('admin/yue/add',{userLists:userLists,date:now.format('YYYY-MM-DD'),user:req.user.name});
    }
  });
  // ding.getUsersList(function(users){
  //   console.log(users);
  //   res.render('admin/yue/add',{userLists:users});
  // });
}

exports.create = function(req, res, next){
    console.log("创建一个新通知");
    //console.log(req.files);
    var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.title) {
      workflow.outcome.errors.push('Please enter a title.');
      return workflow.emit('response');
    }
    workflow.emit('createArticle');
  });

  workflow.on('createArticle', function() {
    var timeCreate = new Date();
    var readers = [];
    req.body.toPersons.forEach(function(person){
      var reader = {};
      reader.id = person.split('/')[0];
      reader.name = person.split('/')[1];
      reader.team = person.split('/')[2];
      reader.isFinished = false;
      readers.push(reader);
    });
    var file_names = (req.body.Files.split('\r\n'));
    file_names = file_names.slice(0,file_names.length-1);
    console.log(file_names);
    console.log(req.body);
    var fieldsToSet = {
      title: req.body.title,
      type:req.body.type,
      general:req.body.general,
      creator:req.body.creator,
      body:req.body.body,
      timeCreated:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      readers:readers,
      files:file_names,
      end:false,
      isImportant:req.body.isImportant,
      timeFinished:req.body.timeFinished,
      search: [
        req.body.title
      ]
    };
    req.app.db.models.Yue.create(fieldsToSet, function(err, yue) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = yue;
      req.flash('success','Yue added');
      res.location('/admin/yue/manage/');
      res.redirect('/admin/yue/manage/');
    });
  });

  workflow.emit('validate');
}

exports.wechat = function(req, res, next){
    console.log("wechat push notification");
}