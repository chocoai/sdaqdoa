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
      results.data.sort(function(a,b){return a.department_name > b.department_name});
      //console.log(results.data);
      res.render('admin/dingtalk/index', { data: results.data});
    }
  });
};

exports.syncandcheck = function(req, res, next){ //比较后得到钉钉变化的人员名单后，再考虑如何同步
  var users = [];//钉钉用户
  var usersLocal = [];//本地数据库里人员
  var users_new = [];//钉钉新增的人员
  var users_removed = [];//钉钉中删除的人员
  console.log("为什么运行两次");
  Ding.getUsersList(function(userslist){
    console.log("回调时，得到的分队数量"+userslist.length);
    console.log("得到按照部门排列的人员详情");
    //将人员信息去重后，压入数组中，准备同步数据库
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
    console.log("钉钉通讯录里总人数=="+users.length);
    
    //console.log(users[0]);
    req.query.username = req.query.username ? req.query.username : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';

    var filters = {};
    filters.source = "dingding";
    req.app.db.models.User.pagedFind({  //检索当地数据库中已有的人员名单
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
        results.data.sort(function(a,b){return a.department_name > b.department_name});
        console.log("本地数据库已经有"+results.data.length+"个账号");
        usersLocal = results.data;
        console.log(usersLocal[0]);
        console.log(users[0]);
        users.forEach(function(user,i,users){
          if(usersLocal.findIndex(function(element,index,array){return element.username == user.userid;}) == -1){
            console.log("新增"+user.name);
            console.log(user.userid);
            users_new.push(user);
          }
        });
        console.log("新增用户数量："+users_new.length);

        usersLocal.forEach(function(userLocal,i,usersLocal){
          //console.log(userLocal.username+"----"+userLocal.name);
          if(users.findIndex(function(element,index,array){return element.userid == userLocal.username;}) == -1){
            console.log("删除了"+userLocal.name);
            users_removed.push(userLocal);
          }
        });
        console.log("删除用户数量:"+users_removed.length);

        users_new.forEach(function(user,i,usersnew){
          var fieldsToSet = {
          username: user.userid,
          name:user.name,
          dingtalk_id:user.userid,
          source:"dingding",
          password:"$2a$10$RReosqZ1JzWETiavNF8pneLLKbjamDvX5lmt3IHJFQf5s4fHqIMrS",
          email:user.mobile+"@sdaoa.com",
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
              //console.log('create exception'+err);
            }
          });
        });//新用户，创建账号


      }
    });


    
    // req.app.db.models.User.remove({ source:"dingding" }, function(err, userexit) {
    //   console.log("删除了"+userexit);
    //   users.forEach(function(user,i,users){
    //     //console.log(user);
    //     //console.log("正在添加"+user.name)           
    //     var fieldsToSet = {
    //       username: user.userid,
    //       name:user.name,
    //       dingtalk_id:user.userid,
    //       source:"dingding",
    //       password:"$2a$10$RReosqZ1JzWETiavNF8pneLLKbjamDvX5lmt3IHJFQf5s4fHqIMrS",
    //       email:user.mobile+"@sdaoa.com",
    //       department_id:user.department_id,
    //       department_name:user.department_name,
    //       avatar:user.avatar,
    //       mobile:user.mobile,
    //       roles:"account",
    //       isActive:"yes",
    //       search: [
    //         user.name
    //       ]
    //     };
    //     req.app.db.models.User.create(fieldsToSet, function(err, user) {
    //       if (err) {
    //         //console.log('create exception'+err);
    //       }
    //     });
    //   });
    //     //将人员数据 加入数据库
    //   
    //     //res.render('admin/dingtalk/index', { data: users});
    // });
    res.redirect('/admin/dingtalk/');
  });
}

exports.sync = function(req, res, next){
  var users = [];
  console.log("为什么运行两次");
  Ding.getUsersList(function(userslist){
    console.log("回调时，得到的分队数量"+ userslist.length);
    console.log("得到按照部门排列的人员详情");
    //将人员信息去重后，压入数组中，准备同步数据库
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
    console.log("总人数=="+users.length);
    //console.log(users[0]);
    req.app.db.models.User.remove({ source:"dingding" }, function(err, userexit) {
      console.log("删除了"+userexit);
      users.forEach(function(user,i,users){
        //console.log(user);
        //console.log("正在添加"+user.name)           
        var fieldsToSet = {
          username: user.userid,
          name:user.name,
          dingtalk_id:user.userid,
          source:"dingding",
          password:"$2a$10$RReosqZ1JzWETiavNF8pneLLKbjamDvX5lmt3IHJFQf5s4fHqIMrS",
          email:user.mobile+"@sdaoa.com",
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
            //console.log('create exception'+err);
          }
        });
      });
        //将人员数据 加入数据库
      res.redirect('/admin/dingtalk/');
        //res.render('admin/dingtalk/index', { data: users});
    });

  });
}