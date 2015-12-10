angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'app/views/pages/home.html',
			controller: 'mainController',
			controllerAs: 'main'
		})

		// login page
		.when('/login', {
			templateUrl: 'app/views/pages/login.html',
			controller: 'mainController',
			controllerAs: 'login'
		})

		// show all users
		.when('/users', {
			templateUrl: 'app/views/pages/users/all.html',
			controller: 'userController',
			controllerAs: 'user'
		})

		.when('/users/create', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userCreateController',
			controllerAs: 'user'
		})

		.when('/users/:user_id', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userEditController',
			controllerAs: 'user'
		})

		.when('/chimes', {
			templateUrl: 'app/views/pages/chimes/all.html',
			controller: 'chimeController',
			controllerAs: 'chime'
		})

		.when('/chimes/create', {
			templateUrl: 'app/views/pages/chimes/single.html',
			controller: 'chimeCreateController',
			controllerAs: 'chime'
		})

		.when('/chimes/:chime_id', {
			templateUrl: 'app/views/pages/chimes/single.html',
			controller: 'chimeEditController',
			controllerAs: 'chime'
		})

	$locationProvider.html5Mode(true);

});
