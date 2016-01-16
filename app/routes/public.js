var bodyParser 		= require('body-parser'); 	// get body-parser
var InterestedUser = require('../models/interestedUser');
var config     		= require('../../config');

module.exports = function(app, express) {

	var publicRouter = express.Router();
	
	// allow post to /interestedUsers w/o authentication
	// ------------------------------------------------------
	publicRouter.route('/interested_users')
		.post(function(req, res) {
			var interestedUser = new InterestedUser();
			interestedUser.name = req.body.name;
			interestedUser.email = req.body.email;

			interestedUser.save(function(err) {
				if(err) {
					return res.send(err);
				}
				res.json({ message: 'Interested User created!' });
			});
		})
	return publicRouter;
};
