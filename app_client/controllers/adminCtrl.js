(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('adminCtrl', ['$http', 'authService', function($http, authService) {
      var vm = this;
      vm.username = '';
      vm.password = '';
      vm.message = '';
      vm.error = '';
      vm.loading = false;

      vm.addAdmin = function() {
        vm.message = vm.error = '';
        if (!vm.username || !vm.password) {
          vm.error = 'Username and password are required';
          return;
        }

        vm.loading = true;

        // POST to backend admin creation endpoint
        $http.post('/api/admin/add', {
          username: vm.username,
          password: vm.password
        }).then(function(res) {
          vm.loading = false;
          vm.message = res.data.message || 'Admin created successfully';
          vm.username = vm.password = '';
        }).catch(function(err) {
          vm.loading = false;
          vm.error = (err.data && err.data.message) || 'Error adding admin';
          console.error('Add admin error:', err);
        });
      };
    }]);
})();