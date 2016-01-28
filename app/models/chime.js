var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChimeSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true },
  artwork: { type: String  },
  waveform: { type: String, required: true },
  startTime: { type: Number, required: true, min: 0 },
  endTime: { type: Number, required: true },
  duration: { type: Number, required: true }
});

ChimeSchema.pre('save', function(next) {
  var chime = this;
  console.log('pre save of chime...');
  next();
});

module.exports = mongoose.model('Chime', ChimeSchema);
