angular.module('chimeService', [])
  .factory('Chime', [
    '$http',
    function($http) {
      var chimeFactory = {};

      chimeFactory.get = function(id) {
        return $http.get('/api/chimes/' + id);
      };

      chimeFactory.all = function() {
        return $http.get('/api/chimes/');
      };

      chimeFactory.create = function(chimeData) {
        return $http.post('/api/chimes/', chimeData);
      };

      chimeFactory.update = function(id, chimeData) {
        return $http.put('/api/chimes/' + id, chimeData);
      };

      chimeFactory.delete = function(id) {
        return $http.delete('/api/chimes/' + id);
      };

      return chimeFactory;
    }
  ]);
