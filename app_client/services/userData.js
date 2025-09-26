// services/userData.js
(function() {
  'use strict';

  angular
    .module('loc8rApp')
    .service('userData', ['$http', '$window', function($http, $window) {
      const apiBase = '/api';

      // Get user profile
      this.getProfile = function() {
        return $http.get(apiBase + '/profile', {
          headers: { Authorization: 'Bearer ' + $window.localStorage.getItem('token') },
          cache: false
        });
      };

      // Update profile
      this.updateProfile = function(userData) {
        return $http.put(apiBase + '/profile', userData, {
          headers: { Authorization: 'Bearer ' + $window.localStorage.getItem('token') }
        });
      };

      // Get user reviews
      this.getUserReviews = function() {
        return $http.get(apiBase + '/profile/reviews', {
          headers: { Authorization: 'Bearer ' + $window.localStorage.getItem('token') },
          cache: false
        });
    };

      // Upload avatar
      this.uploadAvatar = function(file) {
        const formData = new FormData();
        formData.append('avatar', file); // must match multer.single('avatar')

        return $http.post(apiBase + '/profile/avatar', formData, {
          headers: {
            Authorization: 'Bearer ' + $window.localStorage.getItem('token'),
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        });
      };
    }]);
})();