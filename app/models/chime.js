var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChimeSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: Date,
  tags: [String]
});

ChimeSchema.pre('save', function(next) {
  var chime = this;
  console.log('pre save of chime...');
  next();
});

module.exports = mongoose.model('Chime', ChimeSchema);
