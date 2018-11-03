'use strict';

exports = module.exports = function(app, mongoose) {
  var measureSchema = new mongoose.Schema({
    nameToBeMeasured: { type: String, required: true},
    NOTBM:{ type: String, required: true},
    middle: {type: String},
    score: { type: Number},
    s1: { type: Number},
    appendix1: {type: String},
    s2: { type: Number},
    appendix2:{type: String},
    s3: { type: Number},
    appendix3:{type: String},
    s4: { type: Number},
    appendix4:{type: String},
    s5: { type: Number},
    appendix5:{type: String},
    date: { type: Date},
    time: { type: String},
    name: { type: String, required: true},
    username: { type: String, required: true},
    zip: {type: String},
    type: {type:String},
    search: [String],
    isFinished:{type: String}
  });
  measureSchema.plugin(require('./plugins/pagedFind'));
  measureSchema.index({ score: 1 });
  measureSchema.index({ s1: 1 });
  measureSchema.index({ s2: 1 });
  measureSchema.index({ s3: 1 });
  measureSchema.index({ s4: 1 });
  measureSchema.index({ s5: 1 });
  measureSchema.index({ appendix1: 1 });
  measureSchema.index({ appendix2: 1 });
  measureSchema.index({ appendix3: 1 });
  measureSchema.index({ appendix4: 1 });
  measureSchema.index({ appendix5: 1 });
  measureSchema.index({ date: 1 });
  measureSchema.index({ time: 1 });
  measureSchema.index({ name: 1 });
  measureSchema.index({ username: 1 });
  measureSchema.index({ type: 1 });
  measureSchema.index({ search: 1 });
  measureSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Measure', measureSchema);
};