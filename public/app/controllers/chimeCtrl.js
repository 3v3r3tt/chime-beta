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

      vm.lockStartTime = function() {
        console.log('locking startTime');
        vm.splicer.startTimeLocked = true;
        var startTime = +vm.splicer.startTime;
        var duration = vm.selectedTrack.duration;
        var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
        vm.splicer.leftOffset = startTime/duration*width;
        vm.splicer.widthOffset = width - vm.splicer.leftOffset;
      }

      vm.clearStartTime = function() {
        vm.splicer.startTimeLocked = false;
        vm.splicer.endTimeLocked = false;
        vm.splicer.startTime = 0;
        vm.splicer.endTime = 0;
      };


      vm.adjustStartTime = function(startTime) {
        if (vm.splicer.startTimeLocked || startTime === -1) { return };
        vm.splicer.startTime = startTime;
        $scope.$apply();
      };

      vm.setEndTime = function() {
        if (vm.splicer.endTimeLocked) { return };
        vm.widget.pause();
        vm.widget.getPosition(function(time) {
          vm.splicer.endTime = time;
          $scope.$apply();
        })
      };

      vm.lockEndTime = function() {
        vm.splicer.endTimeLocked = true;
        var startTime = +vm.splicer.startTime;
        var endTime = +vm.splicer.endTime;
        var duration = vm.selectedTrack.duration;
        var width = angular.element(document.getElementById('slider-container'))[0].clientWidth;
        vm.splicer.chimeWidth = (endTime - startTime)*width/duration;

        vm.widget.bind('playProgress', function(info) {
          if (info.currentPosition >= vm.splicer.endTime) {
            vm.widget.pause();
          }
        });
      }

      vm.clearEndTime = function() {
        vm.widget.unbind('playProgress');
        vm.splicer.endTimeLocked = false;
        vm.splicer.endTime = vm.splicer.startTime;
        vm.splicer.chimeWidth = 0;
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

      vm.playTrackSection = function() {
        vm.widget.seekTo(vm.splicer.startTime);
        vm.widget.isPaused(function(val) {
          if (val) { vm.widget.play(); }
        })
      };

      vm.selectTrack = function(track) {
        vm.selectedTrack = track;
        if(track !== vm.streamingTrack) {
          vm.playTrack(track).then(function() {
            vm.bindWidgetActions();
          });
        } else {
          vm.bindWidgetActions()
        }
      };

      vm.clearSelectedTrack = function() {
        delete vm.selectedTrack;
        delete vm.splicer;
        vm.widget.unbind('seek');
        vm.widget.unbind('play');
        vm.widget.unbind('pause');
      };

      vm.bindWidgetActions = function() {
        vm.widget.bind('seek', function(info) {
          vm.adjustStartTime(info.currentPosition);
        });

        vm.widget.bind('play', function() {
          vm.showEndTimeSetter = true;
          $scope.$apply();
        });

        vm.widget.bind('pause', function() {
          vm.showEndTimeSetter = false;
          $scope.$apply();
        });
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
