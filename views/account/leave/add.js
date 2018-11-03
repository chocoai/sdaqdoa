exports.addNian = function(req, res, next){
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
    if (err) {
        return callback(err, null);
    }
    var persons = results.data.filter(function(item,index,array){
      return(item.zip == "航线或维修支持主管");
    });
    var managers = results.data.filter(function(item,index,array){
      return(item.zip == "中队长");
    });
    res.render('account/leave/addNian',{persons:persons,managers:managers});
    });
}

exports.addTi = function(req, res, next){
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
    if (err) {
        return callback(err, null);
    }
    var persons = results.data.filter(function(item,index,array){
      return(item.zip == "航线或维修支持主管");
    });
    var managers = results.data.filter(function(item,index,array){
      return(item.zip == "中队长");
    });
    res.render('account/leave/addTi',{allPersons:results.data,persons:persons,managers:managers});
    });
}

exports.addHuan = function(req, res, next){
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
    if (err) {
        return callback(err, null);
    }
    var persons = results.data.filter(function(item,index,array){
      return(item.zip == "航线或维修支持主管");
    });
    var managers = results.data.filter(function(item,index,array){
      return(item.zip == "中队长");
    });
    res.render('account/leave/addHuan',{allPersons:results.data,persons:persons,managers:managers});
    });
}

exports.createNian = function(req, res, next){
    console.log("创建一个新的年假申请单");
    var workflow = req.app.utility.workflow(req, res);
    var userAccount={};
    var persons = [];

  workflow.on('validate', function() {
      req.app.db.models.Account.findById(req.user.roles.account.id, 'name company phone zip').exec(function(err, account) {
        if (err) {
          callback(err, null);
        }
        console.log(req.user.roles.account.id);
        console.log(account);
        userAccount = account;
        workflow.emit('getPersons');
      });
  });

  workflow.on('getPersons', function() {
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
      if (err) {
          return callback(err, null);
      }
      persons = results.data;
      console.log("获取到了所有人员信息");
      workflow.emit('createLeave');
    });
     
  });

  workflow.on('createLeave', function() {
    var timeCreate = new Date();
    console.log(req.user.username);
    var applicantSupervisor = fillPersonInfo(req.body.applicantSupervisor,persons);
    applicantSupervisor.stage = "applicantSupervisor";
    var manager = fillPersonInfo(req.body.manager,persons);
    manager.stage = "manager";
    var fieldsToSet = {
      type:req.body.type,
      cUsername:req.user.username,
      creator:{
        username:req.user.username,
        name:userAccount.name.first,
        team:userAccount.name.middle,
        position:userAccount.name.last,
      },
      general:req.body.general,
      destination:req.body.destination,
      status:"draft",
      timeCreate:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      startDate:req.body.startDate,
      endDate:req.body.endDate,
      nianWorkDay:req.body.nianWorkDay,
      applicantSupervisor:applicantSupervisor,
      manager:manager,
      search: [
        req.body.type
      ]
    };
    req.app.db.models.Leave.create(fieldsToSet, function(err, article) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = article;
      req.flash('success','休假创建成功！');
      res.location('/account/leave/');
      res.redirect('/account/leave/');
    });
  });

  workflow.emit('validate');
}

exports.createTi = function(req, res, next){
    console.log("创建一个新的替班申请单");
    var workflow = req.app.utility.workflow(req, res);
    var userAccount={};

  workflow.on('validate', function() {
      req.app.db.models.Account.findById(req.user.roles.account.id, 'name company phone zip').exec(function(err, account) {
        if (err) {
          callback(err, null);
        }
        console.log(req.user.roles.account.id);
        console.log(account);
        userAccount = account;
        workflow.emit('getPersons');
      });
  });

  workflow.on('getPersons', function() {
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
      if (err) {
          return callback(err, null);
      }
      persons = results.data;
      console.log("获取到了所有人员信息");
      workflow.emit('createLeave');
    });
  });

  workflow.on('createLeave', function() {
    var timeCreate = new Date();
    var respondent = fillPersonInfo(req.body.respondent,persons);
    var respondentSupervisor = fillPersonInfo(req.body.respondentSupervisor,persons);
    respondentSupervisor.stage = "respondentSupervisor";
    var applicantSupervisor = fillPersonInfo(req.body.applicantSupervisor,persons);
    applicantSupervisor.stage = "applicantSupervisor";
    var manager = fillPersonInfo(req.body.manager,persons);
    manager.stage = "manager";
    console.log(req.user.username);
    var fieldsToSet = {
      type:req.body.type,
      cUsername:req.user.username,
      creator:{
        username:req.user.username,
        name:userAccount.name.first,
        team:userAccount.name.middle,
        position:userAccount.name.last,
      },
      respondent:respondent,
      general:req.body.general,
      destination:req.body.destination,
      status:"draft",
      timeCreate:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      startDate:req.body.startDate,
      endDate:req.body.endDate,
      applicantWorkDay:{
        date:req.body.tiDate,
        type:req.body.tiType,
      },
      applicantSupervisor:applicantSupervisor,
      respondentSupervisor:respondentSupervisor,
      manager:manager,
      search: [
        req.body.type
      ]
    };
    req.app.db.models.Leave.create(fieldsToSet, function(err, article) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = article;
      req.flash('success','休假创建成功！');
      res.location('/account/leave/');
      res.redirect('/account/leave/');
    });
  });

  workflow.emit('validate');
}

exports.createHuan = function(req, res, next){
    console.log("创建一个新的换班申请单");
    var workflow = req.app.utility.workflow(req, res);
    var userAccount={};
    workflow.on('validate', function() {
        req.app.db.models.Account.findById(req.user.roles.account.id, 'name company phone zip').exec(function(err, account) {
          if (err) {
            callback(err, null);
          }
          console.log(req.user.roles.account.id);
          console.log(account);
          userAccount = account;
          workflow.emit('getPersons');
        });
    });

   workflow.on('getPersons', function() {
    req.query.search = req.query.search ? req.query.search : '';
    req.query.status = req.query.status ? req.query.status : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-_id';
    var filters = {};
    if (req.query.search) {
    filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
    }
    if (req.query.status) {
    filters['status.id'] = req.query.status;
    }

    req.app.db.models.Account.pagedFind({
        filters: filters,
        keys: 'user name company phone zip',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function(err, results) {
      if (err) {
          return callback(err, null);
      }
      persons = results.data;
      console.log("获取到了所有人员信息");
      workflow.emit('createLeave');
    });
  });

  workflow.on('createLeave', function() {
    var timeCreate = new Date();
    var respondent = fillPersonInfo(req.body.respondent,persons);
     var respondentSupervisor = fillPersonInfo(req.body.respondentSupervisor,persons);
    respondentSupervisor.stage = "respondentSupervisor";
    var applicantSupervisor = fillPersonInfo(req.body.applicantSupervisor,persons);
    applicantSupervisor.stage = "applicantSupervisor";
    var manager = fillPersonInfo(req.body.manager,persons);
    manager.stage = "manager";
    console.log(req.user.username);
    var fieldsToSet = {
      type:req.body.type,
      cUsername:req.user.username,
      creator:{
        username:req.user.username,
        name:userAccount.name.first,
        team:userAccount.name.middle,
        position:userAccount.name.last,
      },
      respondent:respondent,
      general:req.body.general,
      destination:req.body.destination,
      status:"draft",
      timeCreate:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
      startDate:req.body.startDate,
      endDate:req.body.endDate,
      applicantWorkDay:{
        date:req.body.tiDate,
        type:req.body.tiType,
      },
      respondentWorkDay:{
        date:req.body.huanDate,
        type:req.body.huanType,
      },
      applicantSupervisor:applicantSupervisor,
      respondentSupervisor:respondentSupervisor,
      manager:manager,
      search: [
        req.body.type
      ]
    };
    req.app.db.models.Leave.create(fieldsToSet, function(err, article) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = article;
      req.flash('success','休假创建成功！');
      res.location('/account/leave/');
      res.redirect('/account/leave/');
    });
  });

  workflow.emit('validate');
}

function fillPersonInfo(username,persons){
  var person = {};
  var obj = {};
  if(username){
    person = persons.filter(function(item,index,array){
      return(item.phone == username);
    })[0];
    obj.name = person.name.first;
    obj.username = username;
    obj.team = person.name.middle;
    obj.position = person.name.last;
    obj.result = "notYet";
    return obj;
  }else{
    console.log("username为空");
    return person;
  }
}