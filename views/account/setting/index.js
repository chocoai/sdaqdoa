'use strict'

exports.init = function(req, res, next){
  //console.log(req.user);
  res.render('account/setting/index', { user: req.user});
};
