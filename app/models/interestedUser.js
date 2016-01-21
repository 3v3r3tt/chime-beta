var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InterestedUserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true}
});

module.exports = mongoose.model('InterestedUser', InterestedUserSchema);
