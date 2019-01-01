'use strict'

exports.findmy = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {cUsername :req.user.username};

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status',
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
      var myLeaves = results.data.reverse();
      res.render('account/leave/index', { data: myLeaves});
    }
  });
};

exports.detail = function(req, res, next){
  var isGotIt = "noNeed";
  req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(leave);
    }
    else {
      console.log(result);
      res.render('account/leave/detail', {leave:result});
    }
  });
};

exports.myDetail = function(req, res, next){
  var isGotIt = "noNeed";
  req.app.db.models.Leave.findById(req.params.id).exec(function(err, result) {
    if (err) {
      return next(err);
    }
    if (req.xhr) {
      res.send(leave);
    }
    else {
      console.log(result);
      res.render('account/leave/myDetail', {leave:result});
    }
  });
};

exports.findall = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  if (req.query.username) {
    filters.title = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  }

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status',
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
      var myLeaves = results.data.reverse();
      res.render('account/leave/allLeaves', { data: myLeaves});
    }
  });
};

exports.findmypassed = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {
    cUsername :req.user.username,
    status:"passed",
  };

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status',
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
      var myLeaves = results.data.reverse();
      res.render('account/leave/index', { data: myLeaves});
    }
  });
};

exports.findmydenied = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {
    cUsername :req.user.username,
    status:"denied",
  };

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status',
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
      var myLeaves = results.data.reverse();
      res.render('account/leave/index', { data: myLeaves});
    }
  });
};

exports.findmyfinished = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {
    cUsername :req.user.username,
    status:"finished",
  };

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status',
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
      var myLeaves = results.data.reverse();
      res.render('account/leave/index', { data: myLeaves});
    }
  });
};