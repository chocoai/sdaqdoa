'use strict';

exports = module.exports = function(app, mongoose) {
  var ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true},
    isImportant:{type:Boolean},
    general: { type: String},
    type:{ type: String},
    creator: { type: String},
    body: { type: String},
    timeCreated: { type:String },
    timeFinished:{type: String },
    numOfReader: { type:Number},
    numOfFinished: {type:Number},
    files:[{type:String}],
    comments: [{
        cName:{type:String},
        username:{type:String},
        cBody:{type:String},
        cTime:{ type: String}
    }],
    commentsByReaders: [{
      cName:{type:String},
      username:{type:String},
      cBody:{type:String},
      cTime:{ type: String}
  }],
    readers:[{
        name:{type:String},
        id:{type:String},
        team:{type:String},
        isFinished:{type:Boolean},
        fTime:{type:String}
    }]
  });
  ArticleSchema.plugin(require('./plugins/pagedFind'));
  ArticleSchema.index({ title: 1 });
  ArticleSchema.index({ general: 1 });
  ArticleSchema.index({ creator: 1 });
  //ArticleSchema.index({ body: 1 });
  ArticleSchema.index({ timeCreated: 1 });
  ArticleSchema.index({ numOfReader: 1 });
  ArticleSchema.index({ numOfFinished: 1 });
  ArticleSchema.index({ readers: 1 });
  ArticleSchema.index({ comments: 1 });

  ArticleSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Noti', ArticleSchema);
};