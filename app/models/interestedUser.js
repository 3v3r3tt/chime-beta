var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var InterestedUserSchema = new Schema({
    email: { type: String, required: true, index: { unique: true }}
});

InterestedUserSchema.pre("save",function(next) {
    var self = this;

    mongoose.models["InterestedUser"].findOne({email : this.email}, 'email', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            console.warn('results', results);
            self.invalidate("email", "email must be unique");
            next(new Error("email must be unique"));
        } else {
            next();
        }
    });
});

module.exports = mongoose.model('InterestedUser', InterestedUserSchema);
