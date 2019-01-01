var imaps = require('imap-simple');
var fs = require('fs');
var iconv = require('iconv-lite');
var moment = require('moment');
var now = moment();
var config = {
    imap: {
        user: 'sdaqdoa@163.com',
        password: 'Sda123456',
        host: 'imap.163.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

exports.create = function(req, res, next){
    var email = {};
    email.attachments = [];
    console.log("准备开始导入邮件");
    imaps.connect(config).then(function (connection) {
 
        connection.openBox('INBOX').then(function (err,box) {
     
            // Fetch emails from the last 24h
            var delay = 24 * 3600 * 1000;
            var yesterday = new Date();
            yesterday.setTime(Date.now() - delay);
            yesterday = yesterday.toISOString();
            var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
            var fetchOptions = { bodies: ['HEADER','TEXT'], struct: true };
     
            // retrieve only the headers of the messages
            return connection.search(['*:*'], fetchOptions);
        }).then(function (messages) {
            if(messages.length == 0){
                console.log("没有新邮件");
            }else{
                console.log("共收到邮件:"+messages.length+"件");
                var attachments = [];
                var htmls = [];
                // console.log("邮件全部信息内容");
                // console.log(messages);
                // console.log("==========属性-结构=========");
                // console.log(imaps.getParts(messages[0].attributes.struct));
                // console.log("=======找出属性结构中，类型为TEXT的结构============");
    
                // console.log("=========邮件内部信息==========");
                // //console.log(messages[0].parts[1].body);
                console.log("时间："+messages[0].parts[0].body.date);
                email.time = messages[0].parts[0].body.date;
                console.log("发件人："+messages[0].parts[0].body.from);
                email.from = messages[0].parts[0].body.from;
                var subjects = messages.map(function (res) {
                    //console.log(res.parts);
                    return res.parts.filter(function (part) {
                        return part.which === 'HEADER';
                    })[0].body.subject[0];
                });
                console.log("主题："+subjects);
                email.subject = subjects;
        
                messages.forEach(function (message) {
    
                    var parts = imaps.getParts(message.attributes.struct);
                    attachments = attachments.concat(parts.filter(function (part) {
                        return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                    }).map(function (part) {
                        console.log("开始搜集附件信息");
                        // retrieve the attachments only of the messages with attachments
                        return connection.getPartData(message, part)
                            .then(function (partData) {
                                let str = String(part.disposition.params.filename);
                                let filename = '';
                                let strs = str.split("=?GBK?B?");
                                strs.forEach(function(str,i,strs){
                                    filename += (decodeFileName(str));
                                });
                                console.log("得到了最终的文件名："+filename);
                                return {
                                    type:'file',
                                    filename: filename,
                                    data: partData
                                };
                            });
                    }));
                    attachments = attachments.concat(parts.filter(function (part) {
                        return part.subtype.toUpperCase() === 'HTML';
                    }).map(function (part) {
                        // retrieve the attachments only of the messages with attachments
                        return connection.getPartData(message, part)
                            .then(function (partData) {
                                var str = iconv.decode(partData, 'GBK'); //return unicode string from GBK encoded bytes
                    
                                email.body = str;
                                return {
   
                                    type:'html',
                                    html: str
                                };
                            });
                    }));
                });
                return Promise.all(attachments);
            }
        }).then(function (attachments,) {

            attachments.forEach(function(file,i,files){
                if(file.type=='file'){
                    fs.writeFile('./public/uploads/'+now.format('YYYY-MM')+'/'+file.filename,file.data,function(err){
                        if(err){throw err}
                        console.log("附件写入成功");
                        email.attachments.push('public/uploads/'+now.format('YYYY-MM')+'/'+file.filename);
                        console.log("开始创建一个新通知");
                        //console.log(email);
                        var workflow = req.app.utility.workflow(req, res);

                        workflow.on('createArticle', function() {
                            var timeCreate = new Date();
                            var readers = [];

                            req.query.username = req.query.username ? req.query.username : '';
                            req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 1000;
                            req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
                            req.query.sort = req.query.sort ? req.query.sort : '-_id';

                            var filters = {};
                            filters.source = "dingding";

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

                                    results.data.forEach(function(person,i,persons){
                                          let reader = {};
                                          reader.id = person.username;
                                          reader.name = person.name;
                                          reader.team = person.department_name;
                                          reader.isFinished = false;
                                          readers.push(reader);

                                    });

                                    var now7 = moment().add(7, 'days');
                                    var fieldsToSet = {
                                        title: email.subject,
                                        type:'通知',
                                        general:email.subject,
                                        creator:email.from,
                                        body:email.body,
                                        timeCreated:timeCreate.getFullYear()+"年"+(timeCreate.getMonth()+1)+"月"+timeCreate.getDate()+"日"+timeCreate.getHours()+":"+timeCreate.getMinutes()+":"+timeCreate.getSeconds(),
                                        readers:readers,
                                        files:email.attachments,
                                        isImportant:false,
                                        timeFinished:now7.format('YYYY-MM-DD'),
                                        search: [
                                          email.subject
                                        ]
                                      };
                                      req.app.db.models.Noti.create(fieldsToSet, function(err, noti) {
                                        if (err) {
                                          return workflow.emit('exception', err);
                                        }
                                  
                                        workflow.outcome.record = noti;
                                        req.flash('success','通知创建成功');
                                        res.location('/admin/noti/manage/');
                                        res.redirect('/admin/noti/manage/');
                                      });
                                }
                            });
                            
                          });
                        
                          workflow.emit('createArticle');
                    });
                }
              
            });
            // =>
            //    [ { filename: 'cats.jpg', data: Buffer() },
            //      { filename: 'pay-stub.pdf', data: Buffer() } ]
        });
    });
}

function decodeFileName(str){
    str = iconv.decode(new Buffer(str,"base64"), 'GBK');
    console.log("GBK解码后"+str);
    return str;
}