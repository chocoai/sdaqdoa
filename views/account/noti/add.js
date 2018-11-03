var ding = require('./ding/ding.js');

exports.add = function(req, res, next){
  // ding.getAccessToken();
  // ding.getDepartments();
   //var users = [];
  ding.getUsersList(function(users){
    console.log(users);
    res.render('account/noti/add',{userLists:users});
  });
}

exports.create = function(req, res, next){
    console.log("创建一个新通知");
    console.log(req.files);
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
      readers.push(reader);
    });
    console.log(req.body);
    var fieldsToSet = {
      title: req.body.title,
      general:req.body.general,
      creator:req.body.creator,
      body:req.body.body,
      timeCreated:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      readers:readers,
      files:req.body.Files,
      isImportant:req.body.isImportant,
      timeFinished:req.body.timeFinished,
      search: [
        req.body.title
      ]
    };
    req.app.db.models.Noti.create(fieldsToSet, function(err, noti) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = noti;
      req.flash('success','Noti added');
      res.location('/account/noti/manage/');
      res.redirect('/account/noti/manage/');
    });
  });

  workflow.emit('validate');
}

exports.wechat = function(req, res, next){
    console.log("wechat push notification");
}