angular.module('interestedUserService', [])
  .factory('InterestedUser', function($http) {
    var interestedUserFactory = {}

    interestedUserFactory.get = function(id) {
      return $http.get('/public/interested_users/' + id);
    };

    interestedUserFactory.all = function() {
      return $http.get('/public/interested_users/');
    };

    interestedUserFactory.create = function(interestedUserData) {
      return $http.post('/public/interested_users/', interestedUserData);
    };

    interestedUserFactory.update = function(id, interestedUserData) {
      return $http.put('/public/interested_users/' + id, interestedUserData);
    };

    interestedUserFactory.delete = function(id) {
      return $http.delete('/public/interested_users/' + id);
    };

    return interestedUserFactory;

  });