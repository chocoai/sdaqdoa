var config = require('./config');
var http = require('http');
var https = require('https');
var sendMessageUrl = "";
var querystring = require('querystring');

exports.getAccessToken = function(){
    http.get(config.tokenUrl, (res) => {//10.24.186.104:8887
        // Do stuff with response
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log("得到token："+parsedData.access_token);//得到accesstoken
            } catch (e) {
                console.log(e.message);
            }
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
}

exports.getDepartments = function(){
    http.get(config.tokenUrl, (res) => {//10.24.186.104:8887
        // Do stuff with response
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log("得到token："+parsedData.access_token);//得到accesstoken
            https.get(config.departmentsUrl+parsedData.access_token, (res) => {//10.24.186.104:8887
                // Do stuff with response
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                  try {
                    const parsedData = JSON.parse(rawData);
                    //console.log(parsedData);//得到accesstoken
                    
                    } catch (e) {
                        console.log(e.message);
                    }
                    });
                }).on('error', (e) => {
                    console.log(`Got error: ${e.message}`);
                });
            } catch (e) {
                console.log(e.message);
            }
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
}

exports.getUsersList = function(callback){
    var usersList = [];
    var numOfTeam = 0;
    http.get(config.tokenUrl, (res) => {//10.24.186.104:8887
        // Do stuff with response
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log("得到token："+parsedData.access_token);
            var access_token = parsedData.access_token;//得到accesstoken
            https.get(config.departmentsUrl+parsedData.access_token, (res) => {
                // Do stuff with response
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                  try {
                    const departData = JSON.parse(rawData);
                    console.log("得到部门信息～～～～～～～");
                    //console.log(departData.department);//得到departments
                    departData.department.forEach(function(depart,i,departments){
                        https.get(config.userListUrl+access_token+'&department_id='+depart.id, (res) => {
                            // Do stuff with response
                            numOfTeam++;
                            res.setEncoding('utf8');
                            let rawData = '';
                            res.on('data', (chunk) => rawData += chunk);
                            res.on('end', () => {
                              try {
                                const UsersListData = JSON.parse(rawData);
                                //console.log(depart);
                                depart.users = UsersListData;
                                //console.log(UsersListData);
                                usersList.push(depart);
                                if(numOfTeam == departments.length){
                                    usersList.sort(function(a,b){
                                        return a.parentid-b.parentid
                                    });
                                    callback(usersList);
                                }
                                } catch (e) {
                                    console.log(e.message);
                                }
                                });
                            }).on('error', (e) => {
                                console.log(`Got error: ${e.message}`);
                            });
                    });
                    
                    } catch (e) {
                        console.log(e.message);
                    }
                    });
                }).on('error', (e) => {
                    console.log(`Got error: ${e.message}`);
                });
            } catch (e) {
                console.log(e.message);
            }
            });
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
}

exports.ding = function(username,text,url){

    http.get("http://10.24.186.104:8887/api/getAccessToken", (res) => {//10.24.186.104:8887
        // Do stuff with response
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData.access_token);//得到accesstoken
            //sendMessageUrl = "https://oapi.dingtalk.com/message/send?access_token="+parsedData.access_token;
            var request = require("request");

            var options = {
                method: 'POST',
                url: 'https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2',
                headers: 
                { 
                    'charset': 'utf-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                formData:
                { 
                    msg: '{"msgtype": "link","link": {"messageUrl":"http://sdabj.com:8888/account/worktime/","picUrl":"http://sdabj.com:8888/media/logo.png","title":"审批提醒","text": "' +text +'"}}',
                    access_token: parsedData.access_token,
                    agent_id: '178631091',
                    userid_list: username
                } 
            };
            console.log(options);
            request(options, function (error, response, body) {
            if (error) throw new Error(error);

                console.log(body);
            });
            

          } catch (e) {
            console.log(e.message);
          }
        });
      }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
      });
   
    
}