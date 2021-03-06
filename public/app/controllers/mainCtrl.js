angular.module('mainCtrl', [])

.controller('mainController', [
	'$rootScope',
	'$location',
	'Auth',
	'InterestedUser',
	function($rootScope, $location, Auth, InterestedUser) {
		var vm = this;

		// get info if a person is logged in
		vm.loggedIn = Auth.isLoggedIn();

		// check to see if a user is logged in on every request
		$rootScope.$on('$routeChangeStart', function() {
			vm.loggedIn = Auth.isLoggedIn();

			// get user information on page load
			Auth.getUser()
				.then(function(data) {
					vm.user = data.data;
				});
		});

		vm.doLogin = function() {
			vm.processing = true;
			vm.error = ''; // clear the error

			Auth.login(vm.loginData.username, vm.loginData.password)
				.success(function(data) {
					vm.processing = false;
					// if a user successfully logs in, redirect to users page
					if (data.success)
						$location.path('/users');
					else
						vm.error = data.message;
				});
		};

		vm.doLogout = function() {
			Auth.logout();
			vm.user = '';
			$location.path('/login');
		};

		vm.doSignUp = function() {
			InterestedUser.create(vm.interestedUser)
				.success(function(data){
					vm.interestedUser = {};
				});
			vm.hideSignUp = true;
			return true;
		};
	}
]);
