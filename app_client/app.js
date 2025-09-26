(function() {
  'use strict';

  angular.module('loc8rApp', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.hashPrefix('');

      $routeProvider
        .when('/', {
           templateUrl: 'views/home.html',
           controller: 'homeCtrl',
           controllerAs: 'vm'
        })
        .when('/admin/add', {
           templateUrl: 'views/admin-add.html',
           controller: 'adminCtrl',
           controllerAs: 'vm',
           resolve: {
             adminCheck: ['authService', '$location', function(authService, $location) {
                // Only allow if the logged-in user is an admin
                if (!authService.isAdmin()) {
                    $location.path('/'); // redirect non-admins
                    }
                   }]
                }
         })
        .when('/home', {
          templateUrl: 'views/home.html',
          controller: 'homeCtrl',
          controllerAs: 'vm'
        })
        .when('/login', {
          templateUrl: 'views/signin.html',
          controller: 'signinCtrl',
          controllerAs: 'vm'
      })
        .when('/register', {
          templateUrl: 'views/register.html',
          controller: 'registerCtrl',
          controllerAs: 'vm'
      })
        .when('/about', {
          templateUrl: 'views/about.html',
          controller: 'aboutCtrl',
          controllerAs: 'vm'
        })
        .when('/profile', {
          templateUrl: 'views/profile.html',
          controller: 'profileCtrl',
          controllerAs: 'vm'
        })
        .when('/profile/edit', {
          templateUrl: 'views/profile-edit.html',
          controller: 'profileEditCtrl',
          controllerAs: 'vm'
      })
        .when('/location/add', {
          templateUrl: 'views/location-form.html',
          controller: 'locationFormCtrl',
          controllerAs: 'vm',
          resolve: {
            adminCheck: ['authService', '$location', function(authService, $location) {
              if (!authService.isAdmin()) {
                  $location.path('/');
                }
          }]}
        })
        .when('/location/:locationid', {
          templateUrl: 'views/location-detail.html',
          controller: 'locationDetailCtrl',
          controllerAs: 'vm'
        })
        .when('/location/:locationid/edit', {
          templateUrl: 'views/location-form.html',
          controller: 'locationFormCtrl',
          controllerAs: 'vm',
          resolve: {
            adminCheck: ['authService', '$location', function(authService, $location) {
              if (!authService.isAdmin()) {
                  $location.path('/');
                }
          }]}
        })
        .when('/location/:locationid/review/add', {
          templateUrl: 'views/review-form.html',
          controller: 'reviewFormCtrl',
          controllerAs: 'vm'
        })
        .when('/location/:locationid/review/:reviewid/edit', {
          templateUrl: 'views/review-form.html',
          controller: 'reviewFormCtrl',
          controllerAs: 'vm'
        })
        .otherwise({ redirectTo: '/' });

    }]);
})();