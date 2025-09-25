(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('navCtrl', navCtrl);

  navCtrl.$inject = ['authService', '$location'];

  function navCtrl(authService, $location) {
    var nav = this;

    // These need to be functions for ng-if()
    nav.isAuthenticated = function() {
      return authService.isAuthenticated();
    };

    nav.isAdmin = function() {
      return authService.isAdmin();
    };

    nav.logout = function() {
      authService.logout();
      $location.path('/signin');
    };

    nav.username = function() {
      var payload = authService.parseToken();
      return payload && payload.username ? payload.username : null;
    };
  }
})();