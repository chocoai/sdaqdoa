'use strict';
var Ding = require('./ding/ding.js');

exports.noti = function(req, res, next){
    console.log(req.params.id);
    req.app.db.models.Noti.findById(req.params.id).exec(function(err, result) {
        if (err) {
          return next(err);
        }
        if (req.xhr) {
          res.send(noti);
        }
        else {
            var readers = result.readers;
            //console.log(readers);
            var usernames = "";
            readers.forEach(reader => {
                usernames += reader.id + ",";
            });
            console.log("拼接后的用户"+usernames);
            Ding.ding(usernames,result.general,"http://sdaoa.com:3333/account/noti/detail/"+req.params.id);
        }
      });
    res.redirect('/admin/noti/manage/');
}