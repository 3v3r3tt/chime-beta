var bodyParser 		= require('body-parser'); 	// get body-parser
var User       		= require('../models/user');
var Chime			 		= require('../models/chime');
var InterestedUser = require('../models/interestedUser');
var jwt        		= require('jsonwebtoken');
var config     		= require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {

	  // find the user
	  User.findOne({
	    username: req.body.username
	  }).select('name username password').exec(function(err, user) {

	    if (err) throw err;

	    // no user with that username was found
	    if (!user) {
	      res.json({
	      	success: false,
	      	message: 'Authentication failed. User not found.'
	    	});
	    } else if (user) {

	      // check if password matches
	      var validPassword = user.comparePassword(req.body.password);
	      if (!validPassword) {
	        res.json({
	        	success: false,
	        	message: 'Authentication failed. Wrong password.'
	      	});
	      } else {

	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign({
	        	name: user.name,
	        	username: user.username
	        }, superSecret, {
	          expiresInMinutes: 1440 // expires in 24 hours
	        });

	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Enjoy your token!',
	          token: token
	        });
	      }

	    }

	  });
	});

	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];
	  // decode token
	  if (token) {
	    // verifies secret and checks exp
	    jwt.verify(token, superSecret, function(err, decoded) {
	      if (err) {
	        res.status(403).send({
	        	success: false,
	        	message: 'Failed to authenticate token.'
	    	});
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;

	        next(); // make sure we go to the next routes and don't stop here
	      }
	    });
	  } else {
	    // return an HTTP response of 403 (access forbidden) and an error message
   	 	res.status(403).send({
   	 		success: false,
   	 		message: 'No token provided.'
   	 	});
	  }
	});

	// test route to make sure everything is working
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'Welcome to the Chime web API!' });
	});

	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)

			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else
						return res.send(err);
				}
				// return a message
				res.json({ message: 'User created!' });
			});
		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {
			User.find({}, function(err, users) {
				if (err) res.send(err);
				// return the users
				res.json(users);
			});
		});

	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/users/:user_id')
		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	})

	// on routes that end in /chimes
	// ------------------------------------------------------
	apiRouter.route('/chimes')

		.post(function(req, res) {
			var chime = new Chime();
			chime.title = req.body.title;
			chime.artist = req.body.artist;
			chime.url = req.body.url;
			chime.genre = req.body.genre;
			chime.description = req.body.description;
			chime.tags = req.body.tags;
			chime.artwork = req.body.artwork;
			chime.waveform = req.body.waveform;
			chime.startTime = req.body.startTime;
			chime.endTime = req.body.endTime;
			chime.duration = req.body.duration;

			chime.save(function(err) {
				if(err) {
					return res.send(err);
				}
				res.json({ message: 'Chime created!' });
			});
		})

		.get(function(req, res) {
			Chime.find({}, function(err, chimes) {
				if (err) res.send(err);
				res.json(chimes);
			});
		});

	apiRouter.route('/chimes/:chime_id')

		.get(function(req, res) {
			Chime.findById(req.params.chime_id, function(err, chime) {
				if (err) res.send(err);
				res.json(chime);
			});
		})

		.put(function(req, res) {
			Chime.findById(req.params.chime_id, function(err, chime) {
				if (req.body.title) chime.title = req.body.title;
				if (req.body.artist) chime.title = req.body.artist;
				if (req.body.url) chime.title = req.body.url;
				if (req.body.description) chime.title = req.body.description;
				if (req.body.genre) chime.title = req.body.genre;
				if (req.body.tags) chime.title = req.body.tags;
				if (req.body.artwork) chime.title = req.body.artwork;
				if (req.body.waveform) chime.title = req.body.waveform;
				if (req.body.startTime) chime.title = req.body.startTime;
				if (req.body.endTime) chime.title = req.body.endTime;
				if (req.body.duration) chime.title = req.body.duration;

				chime.save(function(err){
					if (err) res.send(err);
					res.json({ message: 'Chime updated!' });
				});
			});
		})

		.delete(function(req, res) {
			Chime.remove({
				_id: req.params.chime_id
			}, function(err, chime) {
				if (err) res.send(err);
				res.json({ message: 'Successfully deleted!' })
			});
		});

	// on routes that end in /interested_users
	// ---
	apiRouter.route('/interested_users')

		.post(function(req, res) {
			var interestedUser = new InterestedUser();
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

	apiRouter.route('/interested_users/:interested_user_id')

		.get(function(req, res) {
			InterestedUser.findById(req.params.interested_user_id, function(err, interestedUser) {
				if (err) res.send(err);
				res.json(interestedUser);
			});
		})

		.put(function(req, res) {
			InterestedUser.findById(req.params.interested_user_id, function(err, interestedUser) {
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

	return apiRouter;
};
