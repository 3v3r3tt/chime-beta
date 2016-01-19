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
  'interestedUserService'])

  .config([
    '$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
    }
  ]);
