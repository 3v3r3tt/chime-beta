angular.module('soundCloudService', [])
	.factory('SoundCloud', [
		'$log',
		function($log) {
      SC.initialize({
  		  client_id: '09552849399f3a58cd8b85d8c5b1218d'
  		});
      var soundCloudFactory = {};

			soundCloudFactory.getTrack = function(id) {
        SC.get('/tracks/' + id).then(function(track){
    		  console.log('Track: ' + track.title);
    			console.log(track);
          return track;
    		});
			};

			// return our entire soundCloudFactory object
			return soundCloudFactory;
		}
	]);
