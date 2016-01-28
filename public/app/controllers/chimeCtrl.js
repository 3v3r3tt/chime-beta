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
    '$scope',
    '$location',
    function(Chime, $scope, $location) {
      var vm = this;
      vm.type = 'create';
      vm.processing = false;
      vm.splicer = {};

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

      vm.saveChime = function() {
        var chime = {
          'title': vm.selectedTrack.title,
          'artist': vm.selectedTrack.user.username,
          'url': vm.selectedTrack.permalink_url,
          'artwork': vm.selectedTrack.artwork_url,
          'waveform': vm.selectedTrack.waveform_url,
          'startTime': vm.splicer.startTime,
          'endTime': vm.splicer.endTime,
          'duration': vm.selectedTrack.duration
        };

        vm.processing = true;
        Chime.create(chime)
          .success(function(data) {
            vm.processing = false;
            vm.chimeData = {};
            vm.cleanUp();
            $location.path('/chimes');
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

  .directive('chimeSplicer', [
    'SoundCloud',
    '$q',
    '$sce',
    '$window',
    function(SoundCloud, $q, $sce, $window) {
      return{
        restrict: 'E',
        scope: {
          chime: '=',
        },
        templateUrl: 'app/views/pages/chimes/chimeSplicer.html',
        link: function(scope, element, attrs) {
          scope.chime.lockStartTime = function() {
            scope.chime.splicer.startTimeLocked = true;
            scope.chime.setSliderOffsets();
          };

          scope.chime.clearStartTime = function() {
            scope.chime.splicer.startTimeLocked = false;
            scope.chime.splicer.endTimeLocked = false;
            scope.chime.splicer.startTime = 0;
            scope.chime.splicer.endTime = 0;
          };

          scope.chime.adjustStartTime = function(startTime) {
            if (scope.chime.splicer.startTimeLocked || startTime === -1) { return; }
            scope.chime.splicer.startTime = startTime;
            scope.$apply();
          };

          scope.chime.setEndTime = function() {
            if (scope.chime.splicer.endTimeLocked) { return; }
            scope.chime.widget.pause();
            scope.chime.widget.getPosition(function(time) {
              scope.chime.splicer.endTime = time;
              scope.$apply();
            });
          };

          scope.chime.lockEndTime = function() {
            scope.chime.splicer.endTimeLocked = true;
            var startTime = +scope.chime.splicer.startTime;
            var endTime = +scope.chime.splicer.endTime;
            var duration = scope.chime.selectedTrack.duration;
            var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
            scope.chime.splicer.chimeWidth = (endTime - startTime)*width/duration;

            scope.chime.widget.bind('playProgress', function(info) {
              if (info.currentPosition >= scope.chime.splicer.endTime) {
                scope.chime.widget.pause();
              }
            });
          };

          scope.chime.clearEndTime = function() {
            scope.chime.widget.unbind('playProgress');
            scope.chime.splicer.endTimeLocked = false;
            scope.chime.splicer.endTime = scope.chime.splicer.startTime;
            scope.chime.splicer.chimeWidth = 0;
          };

          scope.chime.setSliderOffsets = function() {
            var startTime = +scope.chime.splicer.startTime;
            var duration = scope.chime.selectedTrack.duration;
            var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
            scope.chime.splicer.leftOffset = startTime/duration*width;
            scope.chime.splicer.widthOffset = width - scope.chime.splicer.leftOffset;

            if(scope.chime.splicer.endTimeLocked) {
              var endTime = +scope.chime.splicer.endTime;
              scope.chime.splicer.chimeWidth = (endTime - startTime)*width/duration;
            }
          };

          scope.chime.playTrack = function(track) {
            var deferred = $q.defer();
            SoundCloud.playTrack(track.permalink_url)
              .then(function(oEmbed) {
                console.log('oEmbed response: ', oEmbed);
                scope.chime.streamingTrack = track;
                scope.chime.soundCloudWidget = $sce.trustAsHtml(oEmbed.html);
                scope.$apply();

                scope.chime.iframe = document.getElementById('soundcloud_widget').querySelector('iframe');
                scope.chime.widget = SoundCloud.getSC().Widget(scope.chime.iframe);
                deferred.resolve();
              });
            return deferred.promise;
          };

          scope.chime.playTrackSection = function() {
            scope.chime.widget.seekTo(scope.chime.splicer.startTime);
            scope.chime.widget.isPaused(function(val) {
              if (val) { scope.chime.widget.play(); }
            });
          };

          scope.chime.selectTrack = function(track) {
            scope.chime.selectedTrack = track;
            if(track !== scope.chime.streamingTrack) {
              scope.chime.playTrack(track).then(function() {
                scope.chime.bindWidgetActions();
              });
            } else {
              scope.chime.bindWidgetActions();
            }

            // watch for window resizing to adjust sliders
            angular.element($window).bind('resize', function(x) {
              scope.chime.setSliderOffsets();
              scope.$apply();
            });
          };

          scope.chime.cleanUp = function() {
            delete scope.chime.selectedTrack;
            delete scope.chime.splicer;
            scope.chime.widget.unbind('seek');
            scope.chime.widget.unbind('play');
            scope.chime.widget.unbind('pause');
            angular.element($window).unbind('resize');
          };

          scope.chime.bindWidgetActions = function() {
            scope.chime.widget.bind('seek', function(info) {
              scope.chime.adjustStartTime(info.currentPosition);
            });

            scope.chime.widget.bind('play', function() {
              scope.chime.showEndTimeSetter = true;
              scope.$apply();
            });

            scope.chime.widget.bind('pause', function() {
              scope.chime.showEndTimeSetter = false;
              scope.$apply();
            });
          };

          scope.$on('$destroy', function() {
            scope.chime.cleanUp();
          });
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
