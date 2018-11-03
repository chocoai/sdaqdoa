'use strict';
var http = require('http');
var fs = require('fs');
var request = require('request');

exports.init = function(req, res){
  res.render('airplane/index');
};

exports.findStatus = function(req, res){
     var html = ''; 
     var planeNO = req.body.planeNO;
     var options = {
        hostname: 'sdaqd.com',
        port: 7777,
        path: '/getACStatusInfo.php?acreg='+planeNO,
        method: 'GET',
        headers: {
            Connection:'keep-alive',
            Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
            'Accept-Encoding':'gzip, deflate, sdch',
            'Accept-Language':'zh-CN,zh;q=0.8',
            'If-Modified-Since':'Thu, 23 Mar 2017 01:05:10 GMT',
            'Upgrade-Insecure-Requests':'1',
            'Host':'sdaqd.com:7777',
            Referer:'http://sdaqd.com:7777/ACStatus.php',
            Cookie:'SDABJ_PID=012358; SDABJ_Pass=sda123456'
            
        }
    };
        //采用http模块向服务器发起一次get请求      
    http.get(options, function (response) {     
          //用来存储请求网页的整个html内容 
        response.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        response.on('data', function (chunk) {   
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        response.on('end', function () {
            console.log(html);
            res.render('airplane/detail', { data: html});

        }).on('error', function (err) {
            console.log(err);
        });
    });
    
};




