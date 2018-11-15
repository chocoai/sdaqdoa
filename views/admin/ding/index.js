'use strict';
var Ding = require('./ding/ding.js');


exports.init = function(req, res, next){
    req.query.username = req.query.username ? req.query.username : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
  
    var filters = {};
    filters.source = "dingding";
  
    req.app.db.models.User.pagedFind({
      filters: filters,
      keys: 'username email isActive name department_name',
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
        //console.log(results.data);
        var teamLists = [];
        var userLists = [];
        var users = results.data;
        results.data.forEach(function(person,i,persons){
          //console.log(person.department_name);
          //console.log(teamLists.indexOf(person.department_name));
          if(teamLists.indexOf(person.department_name) == -1){
            teamLists.push(person.department_name);
          }
        });
        //console.log(teamLists);
        teamLists.forEach(function(team,i,teams){
          userLists.push({
            team:team,
            userList:users.filter(function(user){return user.department_name == team})
          });
        });
        //console.log(userLists);
        res.render('admin/ding/index',{userLists:userLists});
      }
    });
}

exports.send = function(req, res, next){
    console.log(req.body.text);
    var readers = "";
      req.body.toPersons.forEach(function(person){
        readers += person.split('/')[0]+ ",";
      });

    
    console.log(readers);
    Ding.ding(readers,req.body.text);
    res.redirect('/admin/ding');
}