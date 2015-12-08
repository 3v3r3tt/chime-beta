angular.module('chimeCtrl', ['chimeService'])
  .controller('chimeController', function(Chime) {
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
              vm.chimes = data
            });
        });
    };

  })

  .controller('chimeCreateController', function(Chime) {
    var vm = this;
    vm.type = 'create';

    vm.saveChime = function() {
      vm.processing = true;
      vm.message = '';

      Chime.create(vm.chimeData)
        .success(function(data) {
          vm.processing = false;
          vm.chimeData = {};
          vm.message = data.message;
        });
    }

  })

  .controller('chimeEditController', function($routeParams, Chime) {
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

  });
