angular.module('interestedUserCtrl', ['interestedUserService'])

  .controller('interestedUserController', [
    'InterestedUser',
    function(InterestedUser) {
      var vm = this;
      vm.processing = true;

      InterestedUser.all()
        .success(function(data) {
          vm.processing = false;
          vm.interestedUsers = data;
        });

      vm.exportInterestedUsers = function() {
        var csvContent = "data:text/csv;charset=utf-8,";
        vm.interestedUsers.forEach(function(interestedUser, index){
           dataString = interestedUser.email;
           csvContent += index < vm.interestedUsers.length ? dataString+ "\n" : dataString;
        });
        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
      }

      vm.deleteInterestedUser = function(id) {
        vm.processing = true;

        InterestedUser.delete(id)
          .success(function(data) {
            InterestedUser.all()
              .success(function(data) {
                vm.processing = false;
                vm.interestedUsers = data;
              });
          });
      };
    }
  ])

  .controller('interestedUserCreateController', [
    'InterestedUser',
    function(InterestedUser) {
      var vm = this;
      vm.type = 'create';

      vm.saveInterestedUser = function() {
        vm.processing = true;
        vm.message = '';

        InterestedUser.create(vm.interestedUserData)
          .success(function(data) {
            vm.processing = false;
            vm.interestedUserData = {};
            vm.message = data.message;
          });
      };

    }
  ])

  .controller('interestedUserEditController', [
    '$routeParams',
    'InterestedUser',
    function($routeParams, InterestedUser) {
      var vm = this;
      vm.type = 'update';

      InterestedUser.get($routeParams.interested_user_id)
        .success(function(data) {
          vm.interestedUserData = data;
        });

      vm.saveInterestedUser = function() {
        vm.processing = true;
        vm.message = '';
        InterestedUser.update($routeParams.interested_user_id, vm.interestedUserData)
          .success(function(data) {
            vm.processing = false;
            vm.interestedUserData = {};
            vm.message = data.message;
          });
      };
    }
  ]);
