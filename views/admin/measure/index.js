'use strict'
var userData = {};

exports.initfind = function(req, res, next){//获取所有用户数据
  var users = [];
   var workflow = req.app.utility.workflow(req, res);

  workflow.on('findAllUsers', function() {
    req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
    req.app.db.models.Account.pagedFind({
      filters: filters,
      keys: 'user name company phone zip ',
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
        console.log("get data");
        results.filters = req.query;
        userData = results.data;
        res.render('admin/measure/index', { data: users});
      }
    });
  });

  workflow.emit('findAllUsers');
}

exports.find = function(req, res, next){//计算完成百分比
  var measureData = {};
  var numOfAll = 0;
  var numOfFinished = 0;
  var percent = 0;
  var users = [];
  req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 10000;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  req.app.db.models.Measure.pagedFind({
    filters: filters,
    keys: 'name username score nameToBeMeasured NOTBM type isFinished',
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
      measureData = results.data;
      userData.forEach(function(user,index,array){
        numOfAll = 0;
        numOfFinished = 0;
        percent = 0;
        measureData.forEach(function(measure,i,arr){
          if(user.phone == measure.username){
            ++numOfAll;
            if(measure.isFinished == "true"){
              ++numOfFinished;
            }
          }
        });
        percent = 100*(numOfFinished/numOfAll);
        console.log(numOfFinished + "/" + numOfAll);
        users.push({name:user.name.first,per:percent,finished:numOfFinished,all:numOfAll});
      });
      res.render('admin/measure/index', { data:users});
    }
  });
};

exports.init = function(req, res, next){
   var workflow = req.app.utility.workflow(req, res);

  workflow.on('findAllUsers', function() {
    req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
    req.app.db.models.Account.pagedFind({
      filters: filters,
      keys: 'user name company phone zip ',
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
        console.log("get data");
        results.filters = req.query;
        userData = results.data;
        res.render('admin/measure/add', { data: results.data });
      }
    });
    console.log("start deployMask");
    workflow.emit('deployMask');
    console.log("end find all users");
  });

  workflow.on('deployMask', function() {
    console.log("deployMask");
  });
  workflow.emit('findAllUsers');

};

exports.add = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var fieldsToSet = {};
  workflow.on('createMask', function() {
      userData.forEach(function(item,index,array){
        if(item.name.middle == "副中队长"){
          console.log("找到"+item.name.full);
          array.forEach(function(it,ind,ar){
            if(it.zip == "中队长"){
              console.log("找到"+ it.name.full);
              fieldsToSet = {
                nameToBeMeasured:item.name.first,
                NOTBM:item.phone,
                middle:item.name.middle,
                type:"gaoji",
                isFinished:"false",
                name:it.name.first,
                username:it.phone,
                search: [
                  it.name.first
                ]
              };
              console.log(fieldsToSet);
              workflow.emit('upload');
              
            }//“c”
          });
        }
      });
      req.flash('success','任务分配成功！');
      res.location('/admin/measure/add/');
      res.redirect('/admin/measure/add/');
  });
  workflow.on('upload', function() {
    req.app.db.models.Measure.create(fieldsToSet, function(err, event) {
      if (err) {
        console.log("ops,err"+ fieldsToSet);
        console.log(err);
        //return workflow.emit('exception', err);
      }
      
      console.log('任务分配成功！');

    });
  });
  workflow.emit('createMask');
}

exports.addGaoji = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var fieldsToSet = {};
  workflow.on('createMask', function() {
      userData.forEach(function(item,index,array){
        if(item.name.middle == "航线高级岗及以上"){
          console.log("找到"+item.name.full);
          array.forEach(function(it,ind,ar){
            if((it.zip == "中队长"||it.zip == "副中队长"||it.zip == "航线或维修支持主管"||it.zip == "航线中级岗及以下")&&(item.phone != it.phone)){
              console.log("找到"+ it.name.full);
              fieldsToSet = {
                nameToBeMeasured:item.name.first,
                NOTBM:item.phone,
                middle:item.name.middle,
                type:"gaoji",
                isFinished:"false",
                name:it.name.first,
                username:it.phone,
                search: [
                  it.name.first
                ]
              };
              console.log(fieldsToSet);
              workflow.emit('upload');
              
            }//“c”
          });
        }
      });
      req.flash('success','任务分配成功！');
      res.location('/admin/measure/add/');
      res.redirect('/admin/measure/add/');
  });
  workflow.on('upload', function() {
    req.app.db.models.Measure.create(fieldsToSet, function(err, event) {
      if (err) {
        console.log("ops,err"+ fieldsToSet);
        console.log(err);
        //return workflow.emit('exception', err);
      }
      
      console.log('任务分配成功！');

    });
  });
  workflow.emit('createMask');
}

exports.addM = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var fieldsToSet = {};
  workflow.on('createMask', function() {
      userData.forEach(function(item,index,array){
        if(item.name.middle == "航线或维修支持主管"){
          console.log("找到"+item.name.full);
          array.forEach(function(it,ind,ar){
            if((it.zip == "中队长"||it.zip == "副中队长"||it.zip == "航线或维修支持主管"||it.zip == "航线中级岗及以下"||it.zip == "维修支持中级岗及以下")&&(item.phone != it.phone)){
              console.log("找到"+ it.name.full);
              fieldsToSet = {
                nameToBeMeasured:item.name.first,
                NOTBM:item.phone,
                middle:item.name.middle,
                type:"normal",
                isFinished:"false",
                name:it.name.first,
                username:it.phone,
                search: [
                  it.name.first
                ]
              };
              console.log(fieldsToSet);
              workflow.emit('upload');
              
            }//“c”
          });
        }
      });
      req.flash('success','任务分配成功！');
      res.location('/admin/measure/add/');
      res.redirect('/admin/measure/add/');
  });
  workflow.on('upload', function() {
    req.app.db.models.Measure.create(fieldsToSet, function(err, event) {
      if (err) {
        console.log("ops,err"+ fieldsToSet);
        console.log(err);
        //return workflow.emit('exception', err);
      }
      
      console.log('任务分配成功！');

    });
  });
  workflow.emit('createMask');
}

exports.addNormal = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var fieldsToSet = {};
  workflow.on('createMask', function() {
      userData.forEach(function(item,index,array){
        if(item.name.middle == "航线中级岗及以下"){
          console.log("找到"+item.name.full);
          array.forEach(function(it,ind,ar){
            if((it.zip == "中队长"||it.zip == "副中队长"||it.zip == "航线或维修支持主管"||it.zip == "航线中级岗及以下")&&(item.phone != it.phone)){
              console.log("找到"+ it.name.full);
              fieldsToSet = {
                nameToBeMeasured:item.name.first,
                NOTBM:item.phone,
                middle:item.name.middle,
                type:"normal",
                isFinished:"false",
                name:it.name.first,
                username:it.phone,
                search: [
                  it.name.first
                ]
              };
              console.log(fieldsToSet);
              workflow.emit('upload');
              
            }//“c”
          });
        }
      });
      req.flash('success','任务分配成功！');
      res.location('/admin/measure/add/');
      res.redirect('/admin/measure/add/');
  });
  workflow.on('upload', function() {
    req.app.db.models.Measure.create(fieldsToSet, function(err, event) {
      if (err) {
        console.log("ops,err"+ fieldsToSet);
        console.log(err);
        //return workflow.emit('exception', err);
      }
      
      console.log('任务分配成功！');

    });
  });
  workflow.emit('createMask');
}
exports.addSupport = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);
  var fieldsToSet = {};
  workflow.on('createMask', function() {
      userData.forEach(function(item,index,array){
        if(item.name.middle == "维修支持中级岗及以下"){
          console.log("找到"+item.name.full);
          array.forEach(function(it,ind,ar){
            if((it.zip == "中队长"||it.zip == "副中队长"||it.zip == "航线或维修支持主管"||it.zip == "维修支持中级岗及以下")&&(item.phone != it.phone)){
              console.log("找到"+ it.name.full);
              fieldsToSet = {
                nameToBeMeasured:item.name.first,
                NOTBM:item.phone,
                middle:item.name.middle,
                type:"support",
                isFinished:"false",
                name:it.name.first,
                username:it.phone,
                search: [
                  it.name.first
                ]
              };
              console.log(fieldsToSet);
              workflow.emit('upload');
              
            }//“c”
          });
        }
      });
      req.flash('success','任务分配成功！');
      res.location('/admin/measure/add/');
      res.redirect('/admin/measure/add/');
  });
  workflow.on('upload', function() {
    req.app.db.models.Measure.create(fieldsToSet, function(err, event) {
      if (err) {
        console.log("ops,err"+ fieldsToSet);
        console.log(err);
        //return workflow.emit('exception', err);
      }
      
      console.log('任务分配成功！');

    });
  });
  workflow.emit('createMask');
}

exports.detail = function(req, res, next){
    var measureData = {};
   var workflow = req.app.utility.workflow(req, res);

  workflow.on('findAllUsers', function() {
    req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
    req.app.db.models.Account.pagedFind({
      filters: filters,
      keys: 'user name company phone zip ',
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
        console.log("get data");
        results.filters = req.query;
        userData = results.data;
        //res.render('admin/measure/index', { data: users});
        res.render('admin/measure/detail',{ data: userData,details:{}});
      }
    });
  });

  workflow.emit('findAllUsers');
  //res.render('admin/measure/detail',{ data: users});
}
exports.detailFind = function(req, res, next){
  var personalScore = 0;
  var personalScoreString = '';
  var personalData = [];
  console.log("detail find:"+ req.body.whoMeasure+":"+req.body.whoMeasured);
  req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};

  if(req.body.whoMeasured){
    filters.nameToBeMeasured = req.body.whoMeasured;
  }
  if(req.body.whoMeasure){
    filters.name = req.body.whoMeasure;
  }
  //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  req.app.db.models.Measure.pagedFind({
    filters: filters,
    keys: 'name username score nameToBeMeasured NOTBM type isFinished appendix1 appendix2 appendix3 appendix4 appendix5',
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
      personalData = results.data;
      var personalTotalC = 0;
      var personalNumC =0;
      var personalTotalN = 0;
      var personalNumN =0;
      var personalTotalM = 0;
      var personalNumM =0;
      if(personalData.length && !(req.body.whoMeasure)){
        personalScore = "有数据";
        console.log(personalData);
        personalData.forEach(function(item,index,array){
          if(item.isFinished == "true"){
            if(item.nameToBeMeasured == "陈宾"||item.nameToBeMeasured == "万文海"){//副中队长的测评分数计算
              personalScore += item.score;
            }else if(item.nameToBeMeasured == "王海滨"||item.nameToBeMeasured == "刘耀武"){//高级岗
              if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                personalTotalC += item.score;
                personalNumC +=1;
              }else{
                personalTotalN += item.score;
                personalNumN += 1;
              }
              personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
              personalScore = 0.5*(personalTotalC/personalNumC + personalTotalN/personalNumN);
            }else if(item.nameToBeMeasured == "李斌"||item.nameToBeMeasured == "岳鹏"||item.nameToBeMeasured == "杨大伟"||item.nameToBeMeasured == "陈磊2"||item.nameToBeMeasured == "张少雄"||item.nameToBeMeasured == "常扬"){//主管
              if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                personalTotalC += item.score;
                personalNumC +=1;
              }else if(item.name == "李斌"||item.name == "岳鹏"||item.name == "杨大伟"||item.name == "陈磊2"||item.name == "张少雄"||item.name == "常扬"||item.name == "刘耀武"){
                personalTotalM += item.score;
                personalNumM +=1;
              }else{
                personalTotalN += item.score;
                personalNumN += 1;
              }
              personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalM/personalNumM )+"/有"+personalNumM  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
              personalScore = 0.4*personalTotalC/personalNumC + 0.3*personalTotalM/personalNumM + 0.3*personalTotalN/personalNumN;
            }else{//其他人员
              if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                personalTotalC += item.score;
                personalNumC +=1;
              }else if(item.name == "李斌"||item.name == "岳鹏"||item.name == "杨大伟"||item.name == "陈磊2"||item.name == "张少雄"||item.name == "常扬"||item.name == "刘耀武"){
                personalTotalM += item.score;
                personalNumM +=1;
              }else{
                personalTotalN += item.score;
                personalNumN += 1;
              }
              personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalM/personalNumM )+"/有"+personalNumM  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
              personalScore = 0.3*personalTotalC/personalNumC + 0.4*personalTotalM/personalNumM + 0.3*personalTotalN/personalNumN;
            }
          }
        });

      }else{
        personalScore = "数据为空";
      }
      res.render('admin/measure/detail',{ data: userData,details:results.data,score:personalScore,scoreString:personalScoreString});
    }
    
  });

}
exports.resultsinit = function(req, res, next){
  var measureData = {};
   var workflow = req.app.utility.workflow(req, res);

  workflow.on('findAllUsers', function() {
    req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
    req.app.db.models.Account.pagedFind({
      filters: filters,
      keys: 'user name company phone zip score',
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
        console.log("get data");
        results.filters = req.query;
        userData = results.data;
        //res.render('admin/measure/index', { data: users});
        res.render('admin/measure/results',{ data: userData,details:{}});
      }
    });
  });

  workflow.emit('findAllUsers');
}
exports.results = function(req, res, next){

    var personalScore = 0;
    var personalScoreString = '';
    var personalData = [];

    userData.forEach(function(it,ind,arr){
      console.log("计算"+it.name.first+"的成绩");
      req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
      req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
      req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
      req.query.sort = req.query.sort ? req.query.sort : '_id';
      var filters = {};
      filters.nameToBeMeasured  =it.name.first;
      req.app.db.models.Measure.pagedFind({
        filters: filters,
        keys: 'name username score nameToBeMeasured NOTBM type isFinished',
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
        }    else {
          results.filters = req.query;
          personalData = results.data;
          var personalTotalC = 0;
          var personalNumC =0;
          var personalTotalN = 0;
          var personalNumN =0;
          var personalTotalM = 0;
          var personalNumM =0;
          personalScore = 0;
          if(personalData.length){
            personalScoreString = "有数据";

            personalData.forEach(function(item,index,array){
              if(item.isFinished == "true"){
                if(item.nameToBeMeasured == "陈宾"||item.nameToBeMeasured == "万文海"){//副中队长的测评分数计算
                  personalScore = item.score;
                }else if(item.nameToBeMeasured == "王海滨"||item.nameToBeMeasured == "刘耀武"){//高级岗
                  if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                    personalTotalC += item.score;
                    personalNumC +=1;
                  }else{
                    personalTotalN += item.score;
                    personalNumN += 1;
                  }
                  personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
                  personalScore = 0.5*(personalTotalC/personalNumC + personalTotalN/personalNumN);
                }else if(item.nameToBeMeasured == "李斌"||item.nameToBeMeasured == "岳鹏"||item.nameToBeMeasured == "杨大伟"||item.nameToBeMeasured == "陈磊2"||item.nameToBeMeasured == "张少雄"||item.nameToBeMeasured == "常扬"){//主管
                  if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                    personalTotalC += item.score;
                    personalNumC +=1;
                  }else if(item.name == "李斌"||item.name == "岳鹏"||item.name == "杨大伟"||item.name == "陈磊2"||item.name == "张少雄"||item.name == "常扬"||item.name == "刘耀武"){
                    personalTotalM += item.score;
                    personalNumM +=1;
                  }else{
                    personalTotalN += item.score;
                    personalNumN += 1;
                  }
                  personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalM/personalNumM )+"/有"+personalNumM  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
                  personalScore = 0.4*personalTotalC/personalNumC + 0.3*personalTotalM/personalNumM + 0.3*personalTotalN/personalNumN;
                }else{//其他人员
                  if(item.name == "陈宾"||item.name == "万文海"||item.name == "周飚"){
                    personalTotalC += item.score;
                    personalNumC +=1;
                  }else if(item.name == "李斌"||item.name == "岳鹏"||item.name == "杨大伟"||item.name == "陈磊2"||item.name == "张少雄"||item.name == "常扬"||item.name == "刘耀武"){
                    personalTotalM += item.score;
                    personalNumM +=1;
                  }else{
                    personalTotalN += item.score;
                    personalNumN += 1;
                  }
                  personalScoreString = item.nameToBeMeasured +"的结果\n"+(personalTotalC/personalNumC )+"/有"+personalNumC  +"人\n"+(personalTotalM/personalNumM )+"/有"+personalNumM  +"人\n"+(personalTotalN/personalNumN)+"/有"+personalNumN  +"人";
                  personalScore = 0.3*personalTotalC/personalNumC + 0.4*personalTotalM/personalNumM + 0.3*personalTotalN/personalNumN;
                }
              }
            });

          }else{
            personalScore = "数据为空";
          }
          console.log(it.name.first+"-----------------"+personalScore);
          console.log(personalScoreString);
          it.score = personalScore;
          var fieldsToSet = {
            score: personalScore
          };
          var options = { new: true };
          console.log(it.user.id);
          req.app.db.models.Account.findByIdAndUpdate(it._id, fieldsToSet, options, function(err, account) {
            if (err) {
              console.log("err");
            }
            console.log("upload successfully");
          });
        }
      });
    });

  res.render('admin/measure/results',{data: userData});
}
exports.appendix = function(req, res, next){
  var measureData = {};
  req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 10000;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  filters.s3 = 22;
  //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  req.app.db.models.Measure.pagedFind({
    filters: filters,
    keys: 'name username score nameToBeMeasured NOTBM type isFinished appendix1 appendix2 appendix3 appendix4 appendix5 s1 s2 s3 s4 s5',
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
      measureData = results.data;
      measureData.forEach(function(item,index,array){

      });
      res.render('admin/measure/appendix', { data:results.data});
    }
  });
}

exports.deleteinit = function(req, res, next){
  var persons = ["蔡玉泉","赵冬宇","宋玉","王运川","张立军","宋永辉","李佳伟","江鹏","薛祥","丁九申","刘庆","田唯","薛峰2","刘庆","常扬","杨大伟"];
  var person = "蔡玉泉";
  res.render('admin/measure/delete', { persons:persons});
}
exports.delete = function(req, res, next){
  var measureData= [];
  var persons = ["蔡玉泉","赵冬宇","宋玉","王运川","张立军","宋永辉","李佳伟","江鹏","薛祥","丁九申","刘庆","田唯","薛峰2","刘庆","常扬","杨大伟"];
  req.query.name = req.query.nameToBeMeasured ? req.query.nameToBeMeasured : '';
  req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 100;
  req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
  req.query.sort = req.query.sort ? req.query.sort : '_id';

  var filters = {};
  filters.name = "薛峰2";
  //filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
  req.app.db.models.Measure.pagedFind({
    filters: filters,
    keys: 'name username score nameToBeMeasured NOTBM type isFinished ',
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
      measureData = results.data;
      measureData.forEach(function(item,index,array){
        console.log(item);
        var fieldsToSet = {
            isFinished:"false",
          };
          var options = { new: true };
          req.app.db.models.Measure.findByIdAndUpdate(item._id, fieldsToSet, options, function(err, account) {
            if (err) {
              console.log("err");
            }
            console.log("upload successfully");
          });
      });
      res.render('admin/measure/delete', { persons:persons});
    }
  });
  
}

