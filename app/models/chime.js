var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChimeSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true },
  genre: { type: String },
  description: { type: String },
  tags: { type: String },
  artwork: { type: String  },
  waveform: { type: String, required: true },
  startTime: { type: Number, required: true, min: 0 },
  endTime: { type: Number, required: true },
  duration: { type: Number, required: true }
});

ChimeSchema.pre('save', function(next) {
  var chime = this;
  next();
});

module.exports = mongoose.model('Chime', ChimeSchema);
