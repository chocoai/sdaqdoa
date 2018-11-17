'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    wechat = require('wechat-enterprise'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    passport = require('passport'),
    flash = require('connect-flash'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    multer = require('multer'),
    csrf = require('csurf'),
    querystring = require('querystring'),
    schedule = require("node-schedule");
var API = wechat.API;
//var api = new API('wxf01fb15a9cbdef24', 'AU2gpQG0Ui_9P1dFdAgYMnnHMzmA0YsA859X8mkArFMgKCFOby-BF3busxniltMa', '28');

//create express app
var app = express();

//set storage engine
const storage = multer.diskStorage({
  destination:'./public/uploads',
  filename:function(req,file,cb){
      cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
  }
});
//init upload
const upload = multer({
  storage:storage,
  limits:{
      fileSize:10000000//10M
  }
}).single('myFile');

//keep reference to config
app.config = config;

//微信设置
// var wechatconfig = {
//   token: 'sdabjoa',
//   encodingAESKey: 'dX7eoxCZxsRN2xTyWv89CcgP1n60eTabUJawr2a4xTL',
//   corpId: 'wxf01fb15a9cbdef24'
// };


//setup the web server
app.server = http.createServer(app);

//setup mongoose
mongoose.Promise = global.Promise;  
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose连接错误: '));
app.db.once('open', function () {
  //and... we have a data store
});

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//威信设置//通过认证
// app.use('/corp', wechat(wechatconfig, function (req, res, next) {
//   res.writeHead(200);
//   res.end('hello node api');
// }));

//middleware
//app.use(multer({ dest:'/public/uploads'}));
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey,{ maxAge: 900000000 ,expires: new Date(Date.now() + 9000000000),}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri }),
  cookie : {
    maxAge : 1000 * 60 * 60 * 24 * 365, // 设置 session 的有效时间，单位毫秒
},
}));
//app.use(multer({ dest: '/uploads' }));
//app.use(bodyParser({uploadDir:'/upload'}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(csrf({ cookie: { signed: true } }));
helmet(app);

app.use(flash());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});

//response locals
app.use(function(req, res, next) {
  //res.cookie('_csrfToken', req.csrfToken());
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.webLink = app.config.webLink;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport);

//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./views/http/index').http500);

//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

//listen up
app.server.listen(app.config.port, function(){
  //and... we're live
  console.log('Server is running on port ' + config.port);
});
