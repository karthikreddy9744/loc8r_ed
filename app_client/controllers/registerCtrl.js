(function () {
  'use strict';

  angular.module('loc8rApp')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$http', '$location', 'authService'];

  function registerCtrl($http, $location, authService) {
    var vm = this;
    vm.user = {};      // { username, password, role? }
    vm.error = null;
    vm.message = null;
    vm.loading = false;

    vm.register = function () {
      vm.error = vm.message = null;

      // basic client-side validation
      if (!vm.user.username || !vm.user.password) {
        vm.error = 'Username and password are required.';
        return;
      }

      vm.loading = true;
      vm.user.role = 'user';

      $http.post('/api/register', vm.user)
        .then(function (res) {
          vm.loading = false;
          // If backend returned a token, auto-login and redirect home
          if (res.data && res.data.token) {
            authService.saveToken(res.data.token);
            $location.path('/');
            return;
          }
          // Otherwise show success message and optionally clear form
          vm.message = res.data && res.data.message ? res.data.message : 'Registration successful. Please sign in.';
          vm.user = {};
        })
        .catch(function (err) {
          vm.loading = false;
          vm.error = (err.data && err.data.message) || 'Registration failed';
          console.error('Register error', err);
        });
    };
  }
})();