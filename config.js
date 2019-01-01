'use strict';

exports.port = process.env.PORT || 8088;
exports.webLink = "http://sdaoa.com:8088"
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/sdaqdoa'
};
exports.companyName = 'SDA青岛基地OA';
exports.projectName = 'SDA青岛基地OA';
exports.systemEmail = 'admin@sdabj.com';
exports.cryptoKey = 'k3yb0ardc4t';
exports.accessToken = 'http://sdabj.com:8887/api/getAccessToken';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.requireAccountVerification = false;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +'后台系统',
    address: process.env.SMTP_FROM_ADDRESS || 'admin@sdabj.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'admin@sdabj.com',
    password: process.env.SMTP_PASSWORD || 'sda123456SDA',
    host: process.env.SMTP_HOST || 'admin@sdabj.com',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '',
    secret: process.env.FACEBOOK_OAUTH_SECRET || ''
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  },
  tumblr: {
    key: process.env.TUMBLR_OAUTH_KEY || '',
    secret: process.env.TUMBLR_OAUTH_SECRET || ''
  }
};
