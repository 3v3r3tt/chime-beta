angular.module('soundCloudService', [])
	.factory('SoundCloud', [
		'$log',
		function($log) {
      var CLIENT_ID = '09552849399f3a58cd8b85d8c5b1218d';
      var soundCloudFactory = {};

      SC.initialize({
  		  client_id: CLIENT_ID
  		});

      soundCloudFactory.getTrack = function(id) {
        return SC.get('/tracks/' + id);
      };

      soundCloudFactory.searchTracks = function(term) {
        return SC.get('/tracks', {
          q: term
        });
      };

			return soundCloudFactory;
		}
	]);
