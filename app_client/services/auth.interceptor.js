(function() {
  'use strict';

  angular.module('loc8rApp')
    .factory('authInterceptor', authInterceptor)
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    }]);

  authInterceptor.$inject = ['authService'];

  function authInterceptor(authService) {
    return {
      request: function(config) {
        var token = authService.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      }
    };
  }
})();