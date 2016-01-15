var bodyParser 		= require('body-parser'); 	// get body-parser
var InterestedUser = require('../models/interestedUser');
var config     		= require('../../config');

module.exports = function(app, express) {

	var publicRouter = express.Router();

	// on routes that end in /interestedUsers
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

		.get(function(req, res) {
			InterestedUser.find({}, function(err, interestedUsers) {
				if (err) res.send(err);
				res.json(interestedUsers);
			});
		});

	publicRouter.route('/interested_users/:interested_user_id')

		.get(function(req, res) {
			InterestedUser.findById(req.params.interested_user_id, function(err, interestedUser) {
				if (err) res.send(err);
				res.json(interestedUser);
			});
		})

		.put(function(req, res) {
			InterestedUser.findById(req.params.interested_user_id, function(err, interestedUser) {
				if (req.body.name) interestedUser.name = req.body.name;
				if (req.body.email) interestedUser.email = req.body.email;

				interestedUser.save(function(err){
					if (err) res.send(err);
					res.json({ message: 'Interested User updated!' });
				});
			});
		})

		.delete(function(req, res) {
			InterestedUser.remove({
				_id: req.params.interested_user_id
			}, function(err, interestedUser) {
				if (err) res.send(err);
				res.json({ message: 'Successfully deleted!' })
			});
		});

	return publicRouter;
};
