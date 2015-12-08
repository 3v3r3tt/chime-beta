angular.module('userApp', [
  'ngAnimate',
  'app.routes',
  'authService',
  'mainCtrl',
  'userCtrl',
  'chimeCtrl',
  'userService',
  'chimeService'])

  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  });
