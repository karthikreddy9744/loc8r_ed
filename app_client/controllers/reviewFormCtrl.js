(function () {
  'use strict';

  angular
    .module('loc8rApp')
    .controller('reviewFormCtrl', ['$routeParams', 'loc8rData', '$location',
      function ($routeParams, loc8rData, $location) {
        var vm = this;
        vm.locationid = $routeParams.locationid;
        vm.reviewid = $routeParams.reviewid;
        vm.review = {};
        vm.message = '';

        if (vm.reviewid) {
          // Edit existing review
          loc8rData.getReview(vm.locationid, vm.reviewid)
            .then(function (res) {
              vm.review = res.data;
            })
            .catch(function (err) {
              vm.message = 'Error loading review';
              console.error(err);
            });
        }

        vm.saveReview = function () {
          if (!vm.review.author || !vm.review.reviewText) {
            vm.message = "All fields are required";
            return;
          }

          if (vm.reviewid) {
            // Update
            loc8rData.updateReview(vm.locationid, vm.reviewid, vm.review)
              .then(function () {
                $location.path('/location/' + vm.locationid);
              })
              .catch(function (err) {
                vm.message = 'Error updating review';
                console.error(err);
              });
          } else {
            // Add new
            loc8rData.addReview(vm.locationid, vm.review)
              .then(function () {
                $location.path('/location/' + vm.locationid);
              })
              .catch(function (err) {
                vm.message = 'Error adding review';
                console.error(err);
              });
            
          }
        };
      }]);
})();