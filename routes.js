'use strict';
var multer  = require('multer')
var upload = multer({ dest: './public/uploads/' })

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.redirect('/');
}

function ensureAccount(req, res, next) {
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.config.requireAccountVerification) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}

exports = module.exports = function(app, passport) {
  //front end
  app.get('/', require('./views/index').init);
  app.get('/about/', require('./views/about/index').init);
  app.get('/airplane/', require('./views/airplane/index').init);
  app.post('/airplane/', require('./views/airplane/index').findStatus);
  app.get('/contact/', require('./views/contact/index').init);
  app.post('/contact/', require('./views/contact/index').sendMessage);


  //events routes
  app.get('/events/',require('./views/events/index').find);
  app.get('/events/show/:id',require('./views/events/index').read);
  app.get('/events/add',require('./views/events/index').add);
  app.post('/events/',require('./views/events/index').create);


  //sign up
  app.get('/signup/', require('./views/signup/index').init);
  app.post('/signup/', require('./views/signup/index').signup);

  //social sign up
  app.post('/signup/social/', require('./views/signup/index').signupSocial);
  app.get('/signup/twitter/', passport.authenticate('twitter', { callbackURL: '/signup/twitter/callback/' }));
  app.get('/signup/twitter/callback/', require('./views/signup/index').signupTwitter);
  app.get('/signup/github/', passport.authenticate('github', { callbackURL: '/signup/github/callback/', scope: ['user:email'] }));
  app.get('/signup/github/callback/', require('./views/signup/index').signupGitHub);
  app.get('/signup/facebook/', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: ['email'] }));
  app.get('/signup/facebook/callback/', require('./views/signup/index').signupFacebook);
  app.get('/signup/google/', passport.authenticate('google', { callbackURL: '/signup/google/callback/', scope: ['profile email'] }));
  app.get('/signup/google/callback/', require('./views/signup/index').signupGoogle);
  app.get('/signup/tumblr/', passport.authenticate('tumblr', { callbackURL: '/signup/tumblr/callback/' }));
  app.get('/signup/tumblr/callback/', require('./views/signup/index').signupTumblr);

  //login/out
  app.get('/login/', require('./views/login/index').init);
  app.post('/login/', require('./views/login/index').login);
  app.get('/login/forgot/', require('./views/login/forgot/index').init);
  app.post('/login/forgot/', require('./views/login/forgot/index').send);
  app.get('/login/reset/', require('./views/login/reset/index').init);
  app.get('/login/reset/:email/:token/', require('./views/login/reset/index').init);
  app.put('/login/reset/:email/:token/', require('./views/login/reset/index').set);
  app.get('/logout/', require('./views/logout/index').init);

  //social login
  app.get('/login/twitter/', passport.authenticate('twitter', { callbackURL: '/login/twitter/callback/' }));
  app.get('/login/twitter/callback/', require('./views/login/index').loginTwitter);
  app.get('/login/github/', passport.authenticate('github', { callbackURL: '/login/github/callback/' }));
  app.get('/login/github/callback/', require('./views/login/index').loginGitHub);
  app.get('/login/facebook/', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
  app.get('/login/facebook/callback/', require('./views/login/index').loginFacebook);
  app.get('/login/google/', passport.authenticate('google', { callbackURL: '/login/google/callback/', scope: ['profile email'] }));
  app.get('/login/google/callback/', require('./views/login/index').loginGoogle);
  app.get('/login/tumblr/', passport.authenticate('tumblr', { callbackURL: '/login/tumblr/callback/', scope: ['profile email'] }));
  app.get('/login/tumblr/callback/', require('./views/login/index').loginTumblr);

  //admin
  app.all('/admin*', ensureAuthenticated);
  app.all('/admin*', ensureAdmin);
  app.get('/admin/', require('./views/admin/index').init);


  //admin>dingtalk
  app.get('/admin/dingtalk/', require('./views/admin/dingtalk/index').init);
  app.post('/admin/dingtalk/sync/', require('./views/admin/dingtalk/index').sync);
  app.post('/admin/dingtalk/checkandsync/', require('./views/admin/dingtalk/index').syncandcheck);
  app.get('/admin/ding/', require('./views/admin/ding/index').init);
  app.post('/admin/ding/sendMessage/', require('./views/admin/ding/index').send);

  //admin > noti //通知功能
  app.get('/admin/noti/',require('./views/admin/noti/index').findall);
  app.get('/admin/noti/add/',require('./views/admin/noti/add').add);
  app.post('/admin/noti/add/',upload.single('avatar'),require('./views/admin/noti/add').create);
  app.get('/admin/noti/manage/',require('./views/admin/noti/manage').findall);
  app.get('/admin/noti/detail/:id',require('./views/admin/noti/index').detail);
  app.post('/admin/noti/detail/comment/:id/', require('./views/admin/noti/index').comment);
  app.post('/admin/noti/ding/:id/',require('./views/admin/noti/ding').noti);
  app.post('/admin/noti/delete/:id/',require('./views/admin/noti/manage').delete);
  app.get('/admin/noti/edit/:id/',require('./views/admin/noti/edit').editinit);//编辑
  app.post('/admin/noti/edit/:id/',require('./views/admin/noti/edit').save);
  app.post('/admin/noti/detail/commentbyreaders/:id/', require('./views/admin/noti/index').commentbyreaders);

    //admin > yue //通知功能
    app.get('/admin/yue/',require('./views/admin/yue/index').findall);
    app.get('/admin/yue/add/',require('./views/admin/yue/add').add);
    app.post('/admin/yue/add/',upload.single('avatar'),require('./views/admin/yue/add').create);
    app.get('/admin/yue/manage/',require('./views/admin/yue/manage').findall);
    app.get('/admin/yue/detail/:id',require('./views/admin/yue/index').detail);
    app.post('/admin/yue/detail/comment/:id/', require('./views/admin/yue/index').comment);
    app.post('/admin/yue/ding/:id/',require('./views/admin/yue/ding').noti);
    app.post('/admin/yue/delete/:id/',require('./views/admin/yue/manage').delete);
    app.get('/admin/yue/edit/:id/',require('./views/admin/yue/edit').editinit);//编辑
    app.post('/admin/yue/edit/:id/',require('./views/admin/yue/edit').save);
    app.post('/admin/yue/detail/commentbyreaders/:id/', require('./views/admin/yue/index').commentbyreaders);

  //upload
  app.get('/admin/upload/', require('./views/admin/upload/index').index);
  app.post('/admin/upload', require('./views/admin/upload/index').uploader);
  app.get('/uploads/:id',require('./views/admin/upload/index').download);//下载文件

  //admin > users
  app.get('/admin/users/', require('./views/admin/users/index').find);
  app.post('/admin/users/', require('./views/admin/users/index').create);
  app.get('/admin/users/:id/', require('./views/admin/users/index').read);
  app.put('/admin/users/:id/', require('./views/admin/users/index').update);
  app.put('/admin/users/:id/password/', require('./views/admin/users/index').password);
  app.put('/admin/users/:id/role-admin/', require('./views/admin/users/index').linkAdmin);
  app.delete('/admin/users/:id/role-admin/', require('./views/admin/users/index').unlinkAdmin);
  app.put('/admin/users/:id/role-account/', require('./views/admin/users/index').linkAccount);
  app.delete('/admin/users/:id/role-account/', require('./views/admin/users/index').unlinkAccount);
  app.delete('/admin/users/:id/', require('./views/admin/users/index').delete);

  //admin > administrators
  app.get('/admin/administrators/', require('./views/admin/administrators/index').find);
  app.post('/admin/administrators/', require('./views/admin/administrators/index').create);
  app.get('/admin/administrators/:id/', require('./views/admin/administrators/index').read);
  app.put('/admin/administrators/:id/', require('./views/admin/administrators/index').update);
  app.put('/admin/administrators/:id/permissions/', require('./views/admin/administrators/index').permissions);
  app.put('/admin/administrators/:id/groups/', require('./views/admin/administrators/index').groups);
  app.put('/admin/administrators/:id/user/', require('./views/admin/administrators/index').linkUser);
  app.delete('/admin/administrators/:id/user/', require('./views/admin/administrators/index').unlinkUser);
  app.delete('/admin/administrators/:id/', require('./views/admin/administrators/index').delete);

  //admin > admin groups
  app.get('/admin/admin-groups/', require('./views/admin/admin-groups/index').find);
  app.post('/admin/admin-groups/', require('./views/admin/admin-groups/index').create);
  app.get('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').read);
  app.put('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').update);
  app.put('/admin/admin-groups/:id/permissions/', require('./views/admin/admin-groups/index').permissions);
  app.delete('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').delete);

  //admin > accounts
  app.get('/admin/accounts/', require('./views/admin/accounts/index').find);
  app.post('/admin/accounts/', require('./views/admin/accounts/index').create);
  app.get('/admin/accounts/:id/', require('./views/admin/accounts/index').read);
  app.put('/admin/accounts/:id/', require('./views/admin/accounts/index').update);
  app.put('/admin/accounts/:id/user/', require('./views/admin/accounts/index').linkUser);
  app.delete('/admin/accounts/:id/user/', require('./views/admin/accounts/index').unlinkUser);
  app.post('/admin/accounts/:id/notes/', require('./views/admin/accounts/index').newNote);
  app.post('/admin/accounts/:id/status/', require('./views/admin/accounts/index').newStatus);
  app.delete('/admin/accounts/:id/', require('./views/admin/accounts/index').delete);

  //admin > statuses
  app.get('/admin/statuses/', require('./views/admin/statuses/index').find);
  app.post('/admin/statuses/', require('./views/admin/statuses/index').create);
  app.get('/admin/statuses/:id/', require('./views/admin/statuses/index').read);
  app.put('/admin/statuses/:id/', require('./views/admin/statuses/index').update);
  app.delete('/admin/statuses/:id/', require('./views/admin/statuses/index').delete);

  //admin > categories
  app.get('/admin/categories/', require('./views/admin/categories/index').find);
  app.post('/admin/categories/', require('./views/admin/categories/index').create);
  app.get('/admin/categories/:id/', require('./views/admin/categories/index').read);
  app.put('/admin/categories/:id/', require('./views/admin/categories/index').update);
  app.delete('/admin/categories/:id/', require('./views/admin/categories/index').delete);

  //admin > measure
  app.get('/admin/measure/', require('./views/admin/measure/index').initfind);
  app.post('/admin/measure/', require('./views/admin/measure/index').find);
  app.get('/admin/measure/add/', require('./views/admin/measure/index').init);
  app.post('/admin/measure/add/', require('./views/admin/measure/index').add);
  app.post('/admin/measure/add/gaoji/', require('./views/admin/measure/index').addGaoji);
  app.post('/admin/measure/add/m/', require('./views/admin/measure/index').addM);
  app.post('/admin/measure/add/normal/', require('./views/admin/measure/index').addNormal);
  app.post('/admin/measure/add/support/', require('./views/admin/measure/index').addSupport);

  app.get('/admin/measure/detail/', require('./views/admin/measure/index').detail);
  app.post('/admin/measure/detail/', require('./views/admin/measure/index').detailFind);
  app.get('/admin/measure/results/', require('./views/admin/measure/index').resultsinit);
  app.post('/admin/measure/results/', require('./views/admin/measure/index').results);
  app.get('/admin/measure/appendix/', require('./views/admin/measure/index').appendix);
  app.get('/admin/measure/delete/', require('./views/admin/measure/index').deleteinit);
  app.post('/admin/measure/delete/', require('./views/admin/measure/index').delete);
  //admin > search
  app.get('/admin/search/', require('./views/admin/search/index').find);

  //account
  app.all('/account*', ensureAuthenticated);
  app.all('/account*', ensureAccount);
  app.get('/account/', require('./views/account/index').init);

  //account> test
  app.get('/account/test/',require('./views/account/test/index').index);//我的所有申请单
  app.post('/account/test/wechatCrop',require('./views/account/test/index').wechatCrop);//wechat
  //account> leave
  app.get('/account/leave/',require('./views/account/leave/index').findmy);//我的所有申请单
  app.get('/account/leave/passed/',require('./views/account/leave/index').findmypassed);//我的同意的申请单
  app.get('/account/leave/denied/',require('./views/account/leave/index').findmydenied);//我的被驳回申请单
  app.get('/account/leave/finished/',require('./views/account/leave/index').findmyfinished);//我的已经销假申请单
  app.get('/account/allLeaves/',require('./views/account/leave/findAll').findAll);//基地所有人的申请单
  app.get('/account/allLeaves/proposing/',require('./views/account/leave/findAll').findProposing);//基地所有人的申请单
  app.get('/account/allLeaves/passed/',require('./views/account/leave/findAll').findPassed);//基地所有人的申请单
  app.get('/account/allLeaves/denied/',require('./views/account/leave/findAll').findDenied);//基地所有人的申请单
  app.get('/account/allLeaves/finished/',require('./views/account/leave/findAll').findFinished);//基地所有人的申请单
  app.get('/account/agree/',require('./views/account/leave/agree').findMyAgree);//我的待审批
  app.get('/account/agreed/',require('./views/account/leave/agree').findMyAgreed);//我的通过
  app.get('/account/disagreed/',require('./views/account/leave/agree').findMyDisagreed);//我的驳回
  app.get('/account/leave/detail/:id',require('./views/account/leave/index').detail);//基地申请单详情
  app.get('/account/leave/myDetail/:id',require('./views/account/leave/index').myDetail);//我的申请单详情
  app.get('/account/leave/myAgreeDetail/:id',require('./views/account/leave/agree').myAgreeDetail);//审批界面
  app.get('/account/leave/add/nian/',require('./views/account/leave/add').addNian);
  app.get('/account/leave/add/ti/',require('./views/account/leave/add').addTi);
  app.get('/account/leave/add/huan/',require('./views/account/leave/add').addHuan);
  app.post('/account/leave/add/nian/',require('./views/account/leave/add').createNian);
  app.post('/account/leave/add/ti/',require('./views/account/leave/add').createTi);
  app.post('/account/leave/add/huan/',require('./views/account/leave/add').createHuan);
  app.post('/account/leave/detail/delete/:id/',require('./views/account/leave/delete').delete);//删除申请单
  app.post('/account/leave/detail/proposeIt/:id/',require('./views/account/leave/proposeIt').proposeIt);//提交申请单
  app.post('/account/leave/detail/finishIt/:id/',require('./views/account/leave/finishIt').finishIt);//销假
  app.post('/account/leave/detail/wechat/:id/',require('./views/account/leave/wechatIt').wechatIt);//wechat
  app.post('/account/leave/detail/disagreeIt/:id/',require('./views/account/leave/proposeIt').disagreeIt);//驳回申请单
  app.post('/account/leave/detail/agreeIt/:id/',require('./views/account/leave/proposeIt').agreeIt);//驳回申请单
  app.post('/account/leave/detail/WechatIt/:id/',require('./views/account/wechat/sendMessage').sendMessage);//驳回申请单
  
  //accoutn》yue
  app.get('/account/yue/',require('./views/account/yue/index').findall);
  app.get('/account/yue/detail/:id',require('./views/account/yue/index').detail);
  app.post('/account/yue/detail/comment/:id/', require('./views/account/yue/index').comment);
  app.post('/account/yue/detail/gotit/:id/', require('./views/account/yue/index').gotit);
  //account>noti>api
  app.get('/noti/api/',require('./views/account/noti/api/index').findall);
  app.get('/noti/detail/:id',require('./views/account/noti/api/index').detail);
  //accoutn》noti
  app.get('/account/noti/',require('./views/account/noti/index').findall);
  app.get('/account/noti/noti',require('./views/account/noti/noti/index').noti);//通知类
  app.get('/account/noti/safe',require('./views/account/noti/noti/index').safe);//通知类
  app.get('/account/noti/tech',require('./views/account/noti/noti/index').tech);//通知类
  app.get('/account/setting/',require('./views/account/setting/index').init);//设置主页
  app.get('/account/noti/detail/:id',require('./views/account/noti/index').detail);
  app.post('/account/noti/detail/comment/:id/', require('./views/account/noti/index').comment);
  //account> article
  app.get('/account/article/',require('./views/account/article/index').findall);
  app.get('/account/article/unread/',require('./views/account/article/unread').unread);
  app.get('/account/article/detail/:id',require('./views/account/article/index').detail);
  app.post('/account/article/detail/comment/:id/', require('./views/account/article/index').comment);
  app.post('/account/article/detail/gotIt/:id/', require('./views/account/article/index').gotIt);
  app.get('/account/article/add/',require('./views/account/article/add').add);
  app.post('/account/article/add/',upload.single('avatar'),require('./views/account/article/add').create);
  app.get('/account/article/manage/',require('./views/account/article/manage').findall);
  app.get('/account/article/edit/:id/',require('./views/account/article/manage').editinit);
  app.post('/account/article/edit/:id/',require('./views/account/article/manage').save);
  app.post('/account/article/delete/:id/',require('./views/account/article/manage').delete);
  app.get('/account/article/record/:id',require('./views/account/article/index').record);
  app.post('/account/article/wechat/:id/',require('./views/account/article/wechat').info);
  //app.post('/article/add',require('./views/article/add').create);
//upload
  app.get('/account/upload/', require('./views/account/upload/index').index);
  app.post('/account/upload', require('./views/account/upload/index').uploader);
  app.get('/uploads/:id',require('./views/account/upload/index').download);
    //account > measurement
  app.get('/account/measurement/', require('./views/account/measurement/index').find);
  app.get('/account/measurement/normal/:id/', require('./views/account/measurement/index').normal);
  app.post('/account/measurement/normal/:id/', require('./views/account/measurement/index').update);
  app.get('/account/measurement/support/:id/', require('./views/account/measurement/index').support);
  app.post('/account/measurement/support/:id/', require('./views/account/measurement/index').update);
  app.get('/account/measurement/gaoji/:id/', require('./views/account/measurement/index').gaoji);
  app.post('/account/measurement/gaoji/:id/', require('./views/account/measurement/index').update);
  app.get('/account/measurement/score/', require('./views/account/measurement/index').score);
  //app.put('/account/measurement/measure/', require('./views/account/measurement/index').update);

  //account > verification
  app.get('/account/verification/', require('./views/account/verification/index').init);
  app.post('/account/verification/', require('./views/account/verification/index').resendVerification);
  app.get('/account/verification/:token/', require('./views/account/verification/index').verify);

  //account > settings
  app.get('/account/settings/', require('./views/account/settings/index').init);
  app.put('/account/settings/', require('./views/account/settings/index').update);
  app.put('/account/settings/identity/', require('./views/account/settings/index').identity);
  app.put('/account/settings/password/', require('./views/account/settings/index').password);

  //account > settings > social
  app.get('/account/settings/twitter/', passport.authenticate('twitter', { callbackURL: '/account/settings/twitter/callback/' }));
  app.get('/account/settings/twitter/callback/', require('./views/account/settings/index').connectTwitter);
  app.get('/account/settings/twitter/disconnect/', require('./views/account/settings/index').disconnectTwitter);
  app.get('/account/settings/github/', passport.authenticate('github', { callbackURL: '/account/settings/github/callback/' }));
  app.get('/account/settings/github/callback/', require('./views/account/settings/index').connectGitHub);
  app.get('/account/settings/github/disconnect/', require('./views/account/settings/index').disconnectGitHub);
  app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }));
  app.get('/account/settings/facebook/callback/', require('./views/account/settings/index').connectFacebook);
  app.get('/account/settings/facebook/disconnect/', require('./views/account/settings/index').disconnectFacebook);
  app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: '/account/settings/google/callback/', scope: ['profile email'] }));
  app.get('/account/settings/google/callback/', require('./views/account/settings/index').connectGoogle);
  app.get('/account/settings/google/disconnect/', require('./views/account/settings/index').disconnectGoogle);
  app.get('/account/settings/tumblr/', passport.authenticate('tumblr', { callbackURL: '/account/settings/tumblr/callback/' }));
  app.get('/account/settings/tumblr/callback/', require('./views/account/settings/index').connectTumblr);
  app.get('/account/settings/tumblr/disconnect/', require('./views/account/settings/index').disconnectTumblr);

  //route not found
  app.all('*', require('./views/http/index').http404);
};
