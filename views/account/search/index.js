'use strict';

exports.init = function(req, res){
  res.render('account/search/index',{word:'',results:[]});
};

exports.search = function(req, res){
    console.log(req.body);
    var articles = [];
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
  
    var filters = {};
    if (req.body.text) {
      filters.title = new RegExp('^.*?'+ req.body.text +'.*$', 'i');
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
          results.data.forEach(function(article,i,results){
            article.t = "yue";
            articles.push(article);
          });
        console.log(articles);
        req.app.db.models.Noti.pagedFind({
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
            results.data.forEach(article => {
              article.t = "noti";
              articles.push(article);
            });
            console.log(articles);
            res.render('account/search/index',{word:req.body.text,results:articles});
          }
        });
      }
    });
};
