angular.module('chimeCtrl', ['chimeService', 'soundCloudService'])
  .controller('chimeController', [
    'Chime',
    function(Chime) {
      var vm = this;
      vm.processing = true;

      Chime.all()
        .success(function(data) {
          vm.processing = false;
          vm.chimes = data;
        });

      vm.deleteChime = function(id) {
        vm.processing = true;

        Chime.delete(id)
          .success(function(data) {
            Chime.all()
              .success(function(data) {
                vm.processing = false;
                vm.chimes = data;
              });
          });
      };
    }
  ])

  .controller('chimeCreateController', [
    'Chime',
    'SoundCloud',
    '$scope',
    '$sce',
    '$q',
    function(Chime, SoundCloud, $scope, $sce, $q) {
      var vm = this;
      vm.type = 'create';

      vm.musicProviders = [
        { name: 'SoundCloud', icon: 'fa-soundcloud', value: 'soundCloud' },
        { name: 'Spotify', icon: 'fa-spotify', value: 'spotify' },
        { name: 'Google Play', icon: 'fa-play', value: 'googlePlay' },
        { name: 'Apple Music', icon: 'fa-apple', value: 'appleMusic' },
        { name: 'YouTube', icon: 'fa-youtube-play', value: 'youTube' },
      ];
      vm.currentMusicProvider = vm.musicProviders[0];

      $scope.filterByName = function(name) {
          return function(provider) {
              return provider.name != name;
          };
      };

      vm.setMusicProvider = function(provider) {
        vm.currentMusicProvider = provider;
      };

      vm.lockStartTime = function() {
        console.log('locking startTime');
        vm.startTimeLocked = true;
        var startTime = +vm.startTime;
        var duration = vm.selectedTrack.duration;
        var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
        vm.leftOffset = startTime/duration*width;
        vm.widthOffset = width - vm.leftOffset;
      }

      vm.adjustStartTime = function(startTime) {
        if (vm.startTimeLocked || startTime === -1) { return };
        console.log(vm.startTime);
        console.log('setting startTime to: ', startTime);
        vm.startTime = startTime;
        $scope.$apply();
      };

      vm.setEndTime = function() {
        vm.widget.pause();
        vm.widget.getPosition(function(time) {
          vm.endTime = time;
          $scope.$apply();
        })
      };

      vm.lockEndTime = function() {
        vm.endTimeLocked = true;
        var startTime = +vm.startTime;
        var endTime = +vm.endTime;
        var duration = vm.selectedTrack.duration;
        var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
        vm.chimeWidth = (endTime - startTime)*width/duration;

        vm.widget.bind('playProgress', function(info) {
          if (info.currentPosition >= vm.endTime) {
            vm.widget.pause();
          }
        });
      }

      vm.clearEndTime = function() {
        vm.widget.unbind('playProgress');
        vm.endTimeLocked = false;
        vm.endTime = vm.startTime;
        vm.chimeWidth = 0;
      };

      vm.clearStartTime = function() {
        vm.startTimeLocked = false;
        vm.endTimeLocked = false;
        vm.startTime = 0;
        vm.endTime = 0;
      };

      vm.playTrack = function(track) {
        var deferred = $q.defer();
        SoundCloud.playTrack(track.permalink_url)
          .then(function(oEmbed) {
            console.log('oEmbed response: ', oEmbed);
            vm.streamingTrack = track;
            vm.soundCloudWidget = $sce.trustAsHtml(oEmbed.html);
            $scope.$apply();

            vm.iframe = document.getElementById('soundcloud_widget').querySelector('iframe');
            vm.widget = SoundCloud.getSC().Widget(vm.iframe);
            deferred.resolve();
          });
        return deferred.promise;
      };

      vm.selectTrack = function(track) {
        vm.selectedTrack = track;
        if(track !== vm.streamingTrack) {
          vm.playTrack(track).then(function() {
            vm.widget.bind('seek', function(info) {
              console.log('Seeking....');
              console.log(info);
              vm.adjustStartTime(info.currentPosition);
            });

            vm.widget.bind('play', function() {
              console.log('playing...');
              vm.showEndTimeSetter = true;
              $scope.$apply();
            });

            vm.widget.bind('pause', function() {
              console.log('paused...');
              vm.showEndTimeSetter = false;
              $scope.$apply();
            });
          });
        } else {
          vm.widget.bind('seek', function(info) {
            console.log('Seeking....');
            console.log(info);
            vm.adjustStartTime(info.currentPosition);
          });
          
          vm.widget.bind('play', function() {
            console.log('playing...');
            vm.showEndTimeSetter = true;
            $scope.$apply();
          });

          vm.widget.bind('pause', function() {
            console.log('paused...');
            vm.showEndTimeSetter = false;
            $scope.$apply();
          });
        }
      };

      vm.clearSelectedTrack = function() {
        delete vm.selectedTrack;
      };

      vm.playTrackSection = function() {
        console.log('playTrackSection...');
        console.log(vm.startTime);
        console.log(vm.endTime);
        console.log(vm.selectedTrack);

        vm.widget.seekTo(vm.startTime);
        vm.widget.isPaused(function(val) {
          if (val) { vm.widget.play(); }
        })
      };

      vm.saveChime = function() {
        vm.processing = true;
        vm.message = '';

        Chime.create(vm.chimeData)
          .success(function(data) {
            vm.processing = false;
            vm.chimeData = {};
            vm.message = data.message;
          });
      };
    }
  ])

  .controller('chimeEditController', [
    '$routeParams',
    'Chime',
    function($routeParams, Chime) {
      var vm = this;
      vm.type = 'update';

      Chime.get($routeParams.chime_id)
        .success(function(data) {
          vm.chimeData = data;
        });

      vm.saveChime = function() {
        vm.processing = true;
        vm.message = '';
        Chime.update($routeParams.chime_id, vm.chimeData)
          .success(function(data) {
            vm.processing = false;
            vm.chimeData = {};
            vm.message = data.message;
          });
      };
    }
  ])

  .directive('soundCloudSongSearch', [
    'SoundCloud',
    '$sce',
    function(SoundCloud, $sce) {
      return{
        restrict: 'E',
        scope: {
          chime: '=',
        },
        templateUrl: 'app/views/pages/chimes/soundCloudSongSearch.html',
        link: function(scope, element, attrs) {
          scope.soundCloud = {};
          scope.soundCloudSearchInput = '';

          scope.searchTracks = function(term) {
            SoundCloud.searchTracks(term)
              .then(function(results) {
                console.log('Search results: ', results);
                scope.soundCloud.tracks = results;
                scope.$apply();
              }, function(error) {
                console.log("No tracks found matching that search term: ", error);
              });
          };

          scope.authenticateSoundCloud = function() {
            SoundCloud.authenticate();
          };
        }
      };
    }
  ])

  .directive('spotifySongSearch', [
    '$sce',
    function($sce) {
      return{
        restrict: 'E',
        scope: {
          chime: '=',
        },
        templateUrl: 'app/views/pages/chimes/spotifySongSearch.html',
        link: function(scope, element, attrs) {
          scope.spotify = {};
          scope.spotifySearchInput = '';
        }
      };
    }
  ]);
