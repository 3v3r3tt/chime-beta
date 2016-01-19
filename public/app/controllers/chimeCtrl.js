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
    function(Chime, SoundCloud) {
      var vm = this;
      vm.type = 'create';

      vm.getTrack = function(id) {
        //TODO: need to make this a promise
        vm.soundCloudTrack = SoundCloud.getTrack(id);
        console.log(vm.soundCloudTrack);
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
  ]);
