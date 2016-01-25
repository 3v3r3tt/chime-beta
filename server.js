// CALL THE PACKAGES --------------------
var express    = require('express');
var session    = require('express-session');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var config 	   = require('./config');
var path 	     = require('path');
var Grant 		 = require('grant-express');

var grant = new Grant(require('./config.json'));
var app = express();

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	secret: config.secret,
	resave: false,
	saveUninitialized: false
}))
app.use(morgan('dev'));
app.use(grant)


// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------
// used for routes requiring authentication
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// used for public routes
var publicRoutes = require('./app/routes/public')(app, express);
app.use('/public', publicRoutes);

// MAIN CATCHALL ROUTE ---------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port: ' + config.port);
