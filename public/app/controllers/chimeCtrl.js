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
          'title': vm.chimeData.title,
          'artist': vm.chimeData.artist,
          'url': vm.chimeData.url,
          'description': vm.chimeData.description,
          'genre': vm.chimeData.genre,
          'tags': vm.chimeData.tags,
          'artwork': vm.chimeData.artwork,
          'waveform': vm.chimeData.waveform,
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
    '$scope',
    'Chime',
    function($routeParams, $scope, Chime) {
      var vm = this;
      vm.type = 'update';

      Chime.get($routeParams.chime_id)
        .success(function(data) {
          console.log(data);
          vm.chimeData = data;
          vm.selectedTrack = true;
          vm.splicer = {
            'startTime': vm.chimeData.startTime,
            'endTime': vm.chimeData.endTime,
            'duration': vm.chimeData.duration,
            'startTimeLocked': true,
            'endTimeLocked': true
          };
          console.log(vm.splicer);
          vm.playTrack(vm.chimeData).then(function() {
            vm.lockEndTime();
            vm.setSliderOffsets();
            vm.bindWidgetActions();
          });
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
    '$location',
    function(SoundCloud, $q, $sce, $window, $location) {
      return{
        restrict: 'E',
        scope: {
          chime: '=',
        },
        templateUrl: 'app/views/pages/chimes/chimeSplicer.html',
        link: function(scope, element, attrs) {
          scope.chime.lockStartTime = function() {
            scope.chime.splicer.startTimeLocked = true;
            scope.chime.splicer.endTime = scope.chime.splicer.startTime;
            scope.chime.setSliderOffsets();
          };

          scope.chime.clearStartTime = function() {
            scope.chime.splicer.startTimeLocked = false;
            scope.chime.splicer.endTimeLocked = false;
            scope.chime.splicer.startTime = 0;
            scope.chime.splicer.endTime = 0;
            scope.chime.splicer.leftOffset = 0;
          };

          scope.chime.adjustStartTime = function(startTime) {
            if (scope.chime.splicer.startTimeLocked || startTime === -1) { return; }
            scope.chime.splicer.startTime = startTime;
            scope.chime.setSliderOffsets();
            scope.$apply();
          };

          scope.chime.setStartTime = function() {
            if (scope.chime.splicer.startTimeLocked) { return; }
            scope.chime.widget.getPosition(function(time) {
              scope.chime.splicer.startTime = time;
              scope.chime.setSliderOffsets();
              scope.$apply();
            });
          };

          scope.chime.setEndTime = function() {
            if (scope.chime.splicer.endTimeLocked) { return; }
            scope.chime.widget.pause();
            scope.chime.widget.getPosition(function(time) {
              scope.chime.splicer.endTime = time;
              scope.chime.setSliderOffsets();
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
            var endTime = +scope.chime.splicer.endTime;
            var duration = +scope.chime.chimeData.duration;
            var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;

            scope.chime.splicer.leftOffset = startTime/duration*width;
            scope.chime.splicer.widthOffset = width - scope.chime.splicer.leftOffset;
            scope.chime.splicer.chimeWidth = (endTime - startTime)*width/duration;
          };

          scope.chime.playTrack = function(track) {
            var deferred = $q.defer();
            var url = track.permalink_url || track.url;
            SoundCloud.playTrack(url)
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

            scope.chime.chimeData = {};
            scope.chime.chimeData.title = track.title;
            scope.chime.chimeData.artist = track.user.username;
            scope.chime.chimeData.description = track.description;
            scope.chime.chimeData.genre = track.genre;
            scope.chime.chimeData.tags = track.tag_list;
            scope.chime.chimeData.url = track.permalink_url;
            scope.chime.chimeData.artwork = track.artwork_url || track.user.avatar_url;
            scope.chime.chimeData.waveform = track.waveform_url;
            scope.chime.chimeData.duration = track.duration;

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
            delete scope.chime.splicer;
            if(scope.chime.widget) {
              scope.chime.widget.unbind('seek');
              scope.chime.widget.unbind('play');
              scope.chime.widget.unbind('pause');
            }
            if(angular.element($window)) { angular.element($window).unbind('resize'); }
            if(scope.chime.type == 'create') {
              delete scope.chime.selectedTrack;
            } else {
              $location.path('/chimes');
            }
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
