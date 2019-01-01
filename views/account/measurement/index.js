'use strict'
var userData = {};

exports.find = function(req, res, next){
  req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  filters.username = req.user.username;//filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  req.app.db.models.Measure.pagedFind({
    filters: filters,
    keys: 'name username score nameToBeMeasured type isFinished',
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
      
      var numOfAll = results.data.length;
      var numOfFinished = 0;
      results.data.forEach(function(item,index,array){
        if(item.isFinished == "true"){++numOfFinished;}
      });
      var progressbar ={};
      progressbar.percent= 100*(numOfFinished/numOfAll);
      progressbar.numOfAll = numOfAll;
      progressbar.numOfFinished = numOfFinished;
      res.render('account/measurement/index', { data: results.data , user:req.user,progressbar:progressbar});
    }
  });
};

exports.normal = function(req, res, next){
  req.app.db.models.Measure.findById(req.params.id).exec(function(err, measure) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(measurement);
    }
    else {
      res.render('account/measurement/normal', { measurement:measure});
    }
  });
};

exports.support = function(req, res, next){
  req.app.db.models.Measure.findById(req.params.id).exec(function(err, measure) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(measurement);
    }
    else {
      res.render('account/measurement/support', { measurement:measure});
    }
  });
};
exports.gaoji = function(req, res, next){
  req.app.db.models.Measure.findById(req.params.id).exec(function(err, measure) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(measurement);
    }
    else {
      res.render('account/measurement/gaoji', { measurement:measure});
    }
  });
};

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  workflow.on('validate', function() {

    workflow.emit('updateMeasurement');
  });

    workflow.on('updateMeasurement', function() {
    if(req.body.s1>19&&req.body.d1.length<100){req.body.s1 = 19}
    if(req.body.s2>19&&req.body.d2.length<100){req.body.s2 = 19}
    if(req.body.s3>19&&req.body.d3.length<100){req.body.s4 = 19}
    if(req.body.s5>19&&req.body.d5.length<100){req.body.s5 = 19}
    if(req.body.s3>19&&req.body.d3.length<100){req.body.s3 = 19}
    var fieldsToSet = {
      score: Number(req.body.s1)+Number(req.body.s2)+Number(req.body.s3)+Number(req.body.s4)+Number(req.body.s5),
      s1: req.body.s1,
      appendix1: req.body.d1,
      s2: req.body.s2,
      appendix2:req.body.d2,
      s3: req.body.s3,
      appendix3:req.body.d3,
      s4: req.body.s4,
      appendix4:req.body.d4,
      s5: req.body.s5,
      appendix5:req.body.d5,
      date: new Date(),
      search: [""],
      isFinished:true
    };
    req.app.db.models.Measure.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, measurement) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = measurement;
      req.flash('success', '测评数据更新！');
      res.location('/account/measurement/');
      res.redirect('/account/measurement/');
    });
  });

  workflow.emit('validate');
};

exports.score = function(req, res, next){
  res.render('account/measurement/score');
}
