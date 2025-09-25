(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('locationDetailCtrl', [
      '$routeParams', 'loc8rData',
      function($routeParams, loc8rData) {
        var vm = this;
        vm.locationid = $routeParams.locationid;
        vm.location = null;
        vm.message = '';
        vm.formError = '';

        // Get location with reviews
        vm.getLocation = function() {
          loc8rData.getLocationById(vm.locationid)
            .then(function(response) {
              vm.location = response.data;
              // No need to manually initialize map
              // The map directive will handle vm.location.coords
            })
            .catch(function(err) {
              vm.message = 'Sorry, something went wrong';
              console.error(err);
            });
        };

        // Add review
        vm.addReview = function() {
          if (!vm.newReview || !vm.newReview.author || !vm.newReview.rating || !vm.newReview.reviewText) {
            vm.formError = 'All fields required';
            return;
          }
          vm.formError = '';

          loc8rData.submitReview(vm.locationid, vm.newReview)
            .then(function() {
              vm.newReview = {};
              vm.getLocation(); // Refresh location to show new review
            })
            .catch(function(err) {
              vm.formError = 'Sorry, something went wrong';
              console.error(err);
            });
        };

        // Delete review
        vm.deleteReview = function(reviewid) {
          if (!confirm('Are you sure you want to delete this review?')) return;
          loc8rData.deleteReview(vm.locationid, reviewid)
            .then(function() { vm.getLocation(); })
            .catch(function(err) {
              vm.message = 'Error deleting review';
              console.error(err);
            });
        };

        // Fetch location on load
        vm.getLocation();
      }
    ]);
})();