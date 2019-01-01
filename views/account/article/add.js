exports.add = function(req, res, next){
        req.query.search = req.query.search ? req.query.search : '';
        req.query.status = req.query.status ? req.query.status : '';
        req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
        req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
        req.query.sort = req.query.sort ? req.query.sort : '-_id';
        var filters = {};
        if (req.query.search) {
        filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
        }
        if (req.query.status) {
        filters['status.id'] = req.query.status;
        }

        req.app.db.models.Account.pagedFind({
            filters: filters,
            keys: 'user name company phone zip',
            limit: req.query.limit,
            page: req.query.page,
            sort: req.query.sort
        }, function(err, results) {
        if (err) {
            return callback(err, null);
        }
        var persons = results.data;
        // persons.forEach(function(person){
        //     person.class = "c1";
        //     console.log(person.last);
        //     if(person.name.last == "头等舱"){
        //         person.class = "c2";
        //     }else if(person.name.last == "经济舱乘务员"){
        //         person.class = "c3";
        //     }
        // });
        res.render('account/article/add',{persons:persons});
        });
}

exports.create = function(req, res, next){
    console.log("create a new article");
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
        req.body.toPersons.forEach(function(item){
            var reader = {};
            reader.username = item.split("/")[0];
            reader.name = item.split("/")[1];
            readers.push(reader);
        });
    console.log(req.body);
    var fieldsToSet = {
      title: req.body.title,
      general:req.body.general,
      creator:req.body.creator,
      body:req.body.body,
      timeCreate:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      readers:readers,
      files:req.body.Files,
      isImportant:req.body.isImportant,
      timeFinished:req.body.timeFinished,
      search: [
        req.body.title
      ]
    };
    req.app.db.models.Article.create(fieldsToSet, function(err, article) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = article;
      req.flash('success','Article added');
      res.location('/account/article/manage/');
      res.redirect('/account/article/manage/');
    });
  });

  workflow.emit('validate');
}

exports.wechat = function(req, res, next){
    console.log("wechat push notification");
}