'use strict'

exports.findMyAgree = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {pUsername :req.user.username};

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
      res.render('account/leave/myAgreeList', { data: myLeaves});
    }
  });
};

exports.findMyAgreed = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status applicantSupervisor respondentSupervisor manager',
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
      console.log(myLeaves);
      myLeaves = myLeaves.filter(function(item,index,array){
        console.log(item.applicantSupervisor.username);
        console.log(req.user.username);
        console.log(item.applicantSupervisor.result);
        if(item.respondentSupervisor.username == req.user.username){
          if(item.respondentSupervisor.result == "pass"){return true;}
        }else if(item.applicantSupervisor.username == req.user.username){
          if(item.applicantSupervisor.result == "pass"){return true;}
        }else if(item.manager.username == req.user.username){
          if(item.manager.result == "pass"){return true;}
        }else{
          return false;
        }
      });
      res.render('account/leave/myAgreeHistory', { data: myLeaves});
    }
  });
};

exports.findMyDisagreed = function(req, res, next){
  req.query.name = req.query.name ? req.query.name : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};

  req.app.db.models.Leave.pagedFind({
    filters: filters,
    keys: 'type general creator startDate endDate status applicantSupervisor respondentSupervisor manager',
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
      myLeaves = myLeaves.filter(function(item,index,array){
        if(item.respondentSupervisor.username == req.user.username){
          if(item.respondentSupervisor.result == "reject"){return true;}
        }else if(item.applicantSupervisor.username == req.user.username){
          if(item.applicantSupervisor.result == "reject"){return true;}
        }else if(item.manager.username == req.user.username){
          if(item.manager.result == "reject"){return true;}
        }else{
          return false;
        }
      });
      res.render('account/leave/myAgreeHistory', { data: myLeaves});
    }
  });
};


exports.myAgreeDetail = function(req, res, next){
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
      res.render('account/leave/myAgreeDetail', {leave:result});
    }
  });
};