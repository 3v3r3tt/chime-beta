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

  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
