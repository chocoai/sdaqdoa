var querystring = require('querystring');
var https = require('https');
//企业威信result.applicantSupervisor.username,"您有一条新的假条需要审批",general,"http://sdabj.com/account/agree/"

exports.sendWechatUnread = function(usernames,title,general,url,agentId){
    var access_tokenAPP = "";
    https.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wxe74e8f31ff04c3e2&corpsecret=hfJjipXtHbIChimlWPOFJ8EXN7bGyBlEcnvNLFiX0FA', (res) => {
    res.setEncoding('utf8');
    res.on('data', (d) => {
        d = JSON.parse(String(d));
        access_tokenAPP = d.access_token;
        let time = new Date();
        var dateString = (time.getMonth()+1)+"月"+time.getDate()+"日"+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
        var data = {
            "touser" : usernames,
            "msgtype" : "textcard",
            "agentid" : agentId,
            "textcard" : {
                        "title" : title,
                        "description" : "<div class=\"gray\">"+dateString+"</div> <div class=\"normal\">"+general+"</div><div class=\"highlight\">请及时进行阅签！</div>",
                        "url" : url
            }
        }
        const postData = JSON.stringify(data);

        const options = {
        hostname: 'qyapi.weixin.qq.com',
        path: '/cgi-bin/message/send?access_token=' + access_tokenAPP,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
        };
        const req = https.request(options, (resp) => {
        resp.setEncoding('utf8');
        resp.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        resp.on('end', () => {
        });
        });

        req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(postData);
        req.end();
    });
    }).on('error', (e) => {
    console.error(e);
    });
}
