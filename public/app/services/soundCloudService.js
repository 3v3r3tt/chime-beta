angular.module('soundCloudService', [])
	.factory('SoundCloud', [
		'$location',
		function($location) {
      var CLIENT_ID = '09552849399f3a58cd8b85d8c5b1218d';
      var BASE_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
      var soundCloudFactory = {};

      SC.initialize({
  		  client_id: CLIENT_ID,
        redirect_uri: BASE_URL + '/callback'
  		});

			soundCloudFactory.getSC = function() {
				return SC;
			}

      soundCloudFactory.getTrack = function(id) {
        return SC.get('/tracks/' + id);
      };

      soundCloudFactory.searchTracks = function(term) {
        return SC.get('/tracks', {
          q: term
        });
      };

			soundCloudFactory.playTrack = function(url) {
				var oEmbed = SC.oEmbed(url, {
					auto_play: true,
					maxheight: '70px',
					show_comments: false,
					color: '00ECF2' }
				);

				return oEmbed;
			};

      soundCloudFactory.authenticate = function authenticate() {
        // initiate authentication popup
        return SC.connect(function() {
          // This gets the authenticated user's username
          SC.get('/me', function(me) {
            alert('Hello, ' + me.username);
          });
        });
      };

			return soundCloudFactory;
		}
	]);
