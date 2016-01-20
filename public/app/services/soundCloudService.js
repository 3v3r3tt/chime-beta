angular.module('soundCloudService', [])
	.factory('SoundCloud', [
		'$log',
		function($log) {
      var soundCloudFactory = {};

      SC.initialize({
  		  client_id: '09552849399f3a58cd8b85d8c5b1218d'
  		});

      soundCloudFactory.getTrack = function(id) {
        return SC.get('/tracks/' + id);
      };

			return soundCloudFactory;
		}
	]);
