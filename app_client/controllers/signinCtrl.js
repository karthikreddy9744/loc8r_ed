(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('signinCtrl', signinCtrl);

  signinCtrl.$inject = ['$http', '$location', 'authService'];

  function signinCtrl($http, $location, authService) {
    var vm = this;
    vm.user = {};
    vm.error = null;

    vm.login = function() {
      vm.error = null;
      $http.post('/api/login', vm.user)
        .then(function(res) {
          if (res.data && res.data.token) {
            authService.saveToken(res.data.token);
            // redirect to home
            $location.path('/');
          } else {
            vm.error = 'No token received';
          }
        })
        .catch(function(err) {
          vm.error = (err.data && err.data.message) || 'Login failed';
        });
    };
  }
})();