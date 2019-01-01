'use strict'

exports.unread = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};

  req.app.db.models.Article.pagedFind({
    filters: filters,
    keys: 'title general creator isImportant timeFinished readers',
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
      var articles = [];
      if(results.data.length){
          articles = results.data.reverse();
      }

      articles = articles.filter(function(item,index,array){
        let i = 0;
        item.readers.forEach(function(it){
          if(it.username == req.user.username){
            if(it.isFinished){
            }else{
              i++;
            }
          }
        });
          return i;
      });
      console.log(articles);
      res.render('account/article/unread', { data: articles});
    }
  });
};