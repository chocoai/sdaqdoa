'use strict';

exports = module.exports = function(app, mongoose) {
  var LeaveSchema = new mongoose.Schema({
    type: { type: String, required: true},//类型：nian,ti,huan
    status: {type:String},//请假单状态://draft/proposing/denied/passed/finished/Synchronized
    cUsername:{ type: String},//用于挑选出符合我的请假条
    pUsername:{ type: String},//当前审批人的username
    creator: { 
        username:{ type: String},
        name:{ type: String},
        position:{ type: String},
        team:{ type: String},
    },//申请人
    respondent :{ 
        username:{ type: String},
        name:{ type: String},
        position:{ type: String},
        team:{ type: String},
    },//被申请人
    timeCreated: {type: String},//创建时间
    general: { type: String},//理由备注
    destination: { type: String},//去向
    startDate: { type: String},//假期开始日期
    endDate: { type: String},//假期结束日期
    applicantWorkDay:{//申请人上班日期和种类
        date: { type: String},
        type: { type: String}//night/whiteDay
    },
    respondentWorkDay:{//被申请人上班日期和种类
        date: { type: String},
        type: { type: String}//night/whiteDay
    },
    applicantSupervisor:{//申请人主管
        username:{ type: String},
        stage:{ type: String},
        name:{ type: String},
        position:{ type: String},
        team:{ type: String},
        timeReacted:{ type: String},
        comment:{type: String},
        result:{ type: String},//notYet/proposing/pass/reject
    },
    respondentSupervisor:{//被申请人主管
        username:{ type: String},
        name:{ type: String},
        stage:{ type: String},
        position:{ type: String},
        team:{ type: String},
        timeReacted:{ type: String},
        comment:{type: String},
        result:{ type: String},//notYet/proposing/pass/reject
    },
    manager:{//基地经理
        username:{ type: String},
        name:{ type: String},
        stage:{ type: String},
        position:{ type: String},
        team:{ type: String},
        timeReacted:{ type: String},
        comment:{type: String},
        result:{ type: String},//notYet/proposing/pass/reject
    },
    nianWorkDay:{ type: String},//年假涉及到多天
    comments: [{//评论
        cName:{type:String},
        username:{type:String},
        cBody:{type:String},
        cTime:{ type: String}
    }],
    WriteOff:{ type: String},//消假:true/false
    Synchronized:{ type: String},//同步到考勤平台:true/false
  });
  LeaveSchema.plugin(require('./plugins/pagedFind'));
  LeaveSchema.index({ type: 1 });
  LeaveSchema.index({ status: 1 });
  LeaveSchema.index({ creator: 1 });
  LeaveSchema.index({ general: 1 });
  LeaveSchema.index({ timeCreated: 1 });
  LeaveSchema.index({ startDate: 1 });
  LeaveSchema.index({ endDate: 1 });
  LeaveSchema.index({ applicantWorkD: 1 });
  LeaveSchema.index({ respondentWorkDay: 1 });
  LeaveSchema.index({ applicantSupervisor: 1 });
  LeaveSchema.index({ respondentSupervisor: 1 });
  LeaveSchema.index({ manager: 1 });
  LeaveSchema.index({ nianWorkDay: 1 });
  LeaveSchema.index({ WriteOff: 1 });
  LeaveSchema.index({ Synchronized: 1 });
  LeaveSchema.index({ comments: 1 });

  LeaveSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Leave', LeaveSchema);
};