angular.module('userApp', [
  'ngAnimate',
  'app.routes',
  'authService',
  'mainCtrl',
  'userCtrl',
  'chimeCtrl',
  'interestedUserCtrl',
  'userService',
  'chimeService',
  'interestedUserService',
  'customFilters',
  'ui.bootstrap'])

  .config([
    '$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
    }
  ]);
