(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('reviewFormCtrl', ['$routeParams', '$location', 'loc8rData', function($routeParams, $location, loc8rData) {
      var vm = this;
      vm.locationid = $routeParams.locationid;
      vm.reviewid = $routeParams.reviewid;
      vm.review = {}; // Only rating and reviewText

      vm.formError = '';

      // If editing, fetch existing review
      if (vm.reviewid) {
        loc8rData.getReview(vm.locationid, vm.reviewid)
          .then(function(res) {
            vm.review.rating = res.data.rating;
            vm.review.reviewText = res.data.reviewText;
          })
          .catch(function(err) {
            vm.formError = 'Error fetching review';
          });
      }

      vm.saveReview = function() {
        if (!vm.review.rating || !vm.review.reviewText) {
          vm.formError = 'All fields are required';
          return;
        }

        if (vm.reviewid) {
          // Update existing review
          loc8rData.updateReview(vm.locationid, vm.reviewid, vm.review)
            .then(function(res) {
              $location.path('/location/' + vm.locationid);
            })
            .catch(function(err) {
              vm.formError = 'Error updating review';
            });
        } else {
          // Add new review
          loc8rData.addReview(vm.locationid, vm.review)
            .then(function(res) {
              $location.path('/location/' + vm.locationid);
            })
            .catch(function(err) {
              vm.formError = 'Error adding review';
            });
        }
      };
    }]);
})();