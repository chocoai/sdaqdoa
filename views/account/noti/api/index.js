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

  req.app.db.models.Noti.pagedFind({
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
      res.send(articles);
      //res.render('account/noti/index', { data: articles});
    }
  });
};


exports.detail = function(req, res, next){
    req.app.db.models.Noti.findById(req.params.id).exec(function(err, result) {
      if (err) {
        return next(err);
      }
      if (req.xhr) {
        res.send(noti);
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
        //console.log(result);
        res.send({result:result,teams:teams});
        //res.render('account/noti/detail', { noti:result,teams:teams});
      }
    });
};