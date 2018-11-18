'use strict';

exports.init = function(req, res){
  res.render('account/search/index');
};
'use strict';

exports.search = function(req, res){
    console.log(req.body);
  res.render('account/search/index');
};
