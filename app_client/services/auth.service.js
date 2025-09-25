(function() {
  'use strict';

  angular.module('loc8rApp')
    .service('authService', authService);

  authService.$inject = ['$window'];

  function authService($window) {
    var storage = $window.localStorage;
    var key = 'loc8r_token';

    this.saveToken = function(token) {
      if (token) storage.setItem(key, token);
      else storage.removeItem(key);
    };

    this.getToken = function() {
      return storage.getItem(key);
    };

    this.logout = function() {
      storage.removeItem(key);
    };

    // very small JWT parser for client-only use (not for verification)
    this.parseToken = function() {
      var token = this.getToken();
      if (!token) return null;
      try {
        var payload = token.split('.')[1];
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        payload = decodeURIComponent(atob(payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(payload);
      } catch (e) {
        return null;
      }
    };

    this.getRole = function() {
      var p = this.parseToken();
      return p && p.role ? p.role : null;
    };

    this.isAdmin = function() {
      return this.getRole() === 'admin';
    };

    this.isAuthenticated = function() {
      return !!this.getToken();
    };
  }
})();