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
            res.render('account/article/manage', { data: results.data.reverse() });
            }
        });
};

exports.editinit = function(req, res, next){
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
        req.app.db.models.Article.findById(req.params.id).exec(function(err, result) {
            if (err) {
            return next(err);
            }
            if (req.xhr) {
            res.send(article);
            }else {
                var persons = results.data;;
                persons.forEach(function(person){
                    person.class = "normal";
                    person.selected = false;
                    result.readers.forEach(function(item,index,array){
                        if(item.username == person.phone)
                        {
                            console.log(item.name);
                            person.selected = true;
                        }
                    });
                    
                });
                console.log(result);
                res.render('account/article/edit',{persons:persons,article:result});
            }
        });
        
        });
}
exports.save = function(req, res, next){
    console.log(req.params.id);
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
    
    var fieldsToSet = {
      title: req.body.title,
      general:req.body.general,
      creator:req.body.creator,
      body:req.body.body,
      timeCreate:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      readers:readers,
      isImportant:req.body.isImportant,
      timeFinished:req.body.timeFinished,
      search: [
        req.body.title
      ]
    };
  req.app.db.models.Article.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = measurement;
      req.flash('success', '数据更新成功！');
      res.location('/account/article/manage/');
      res.redirect('/account/article/manage/');
    });
  });
  workflow.emit('validate');
}
exports.delete = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

    workflow.emit('deleteAccount');
    });

    workflow.on('deleteAccount', function(err) {
    req.app.db.models.Article.findByIdAndRemove(req.params.id, function(err, account) {
        if (err) {
        return workflow.emit('exception', err);
        }
        req.flash('success','删除了阅签');
        res.location('/account/article/manage/');
        res.redirect('/account/article/manage/');
    });
    });

    workflow.emit('validate');
}