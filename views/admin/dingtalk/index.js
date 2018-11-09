'use strict';
var Ding = require('./ding/ding.js');
//$2a$10$S5LOI9emg4YGQ2uMN/7oQe47lWUNTuOxfVFp3rh/JfS9rLMWKmeuO-----corpid 
exports.init = function(req, res, next){
  req.query.username = req.query.username ? req.query.username : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '-_id';

  var filters = {};

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
      res.render('admin/dingtalk/index', { data: results.data});
    }
  });
};

exports.sync = function(req, res, next){
    var users = [];
    Ding.getUsersList(function(userslist){
        console.log("得到按照部门排列的人员详情");
        //console.log(userslist[0].users.userlist[0]);
        //将人员信息去重后，压入数组中，准备同步数据库
        //console.log(userslist[1]);
        userslist.forEach(team => {
            //console.log(team);
            if(team.users.userlist.length == 1){
                var person = team.users.userlist[0];
                person.department_name = team.name;
                person.department_id = team.id;
                person.department_parentid = team.parentid;
                users.push(person);
            }else{
                team.users.userlist.forEach(person => {

                    person.department_name = team.name;
                    person.department_id = team.id;
                    person.department_parentid = team.parentid;
                    users.push(person);
                });
            }
            
        });
        console.log("总人数"+users.length);
        //console.log(users[0]);
        req.app.db.models.User.remove({ source:"dingding" }, function(err, userexit) {
            console.log("删除了"+userexit);
        });
        //将人员数据 加入数据库
        users.forEach(function(user,i,users){
            //console.log(user);
            console.log("正在添加"+user.name)           
            if (user.userid) {
                req.app.db.models.User.findOne({ username: req.body.username }, function(err, userexit) {
                    if (err) {
                      console.log('exception'+ err);
                    }
              
                    if (userexit) {
                      console.log('用户已存在：'+ user.name + user.department_name);
                    }else{
                        var fieldsToSet = {
                            username: user.userid,
                            name:user.name,
                            dingtalk_id:user.userid,
                            source:"dingding",
                            password:"$2a$10$S5LOI9emg4YGQ2uMN/7oQe47lWUNTuOxfVFp3rh/JfS9rLMWKmeuO",
                            email:user.orgEmail,
                            department_id:user.department_id,
                            department_name:user.department_name,
                            avatar:user.avatar,
                            mobile:user.mobile,
                            roles:"account",
                            isActive:"yes",
                            search: [
                              user.name
                            ]
                          };
                        req.app.db.models.User.create(fieldsToSet, function(err, user) {
                            if (err) {
                              console.log('exception'+err);
                            }
                          });
                    }

                  });
            }
        });
        res.redirect('/admin/dingtalk/');
        //res.render('admin/dingtalk/index', { data: users});
    });
    
    
}

