angular.module('loc8rApp')
.controller('profileCtrl', ['userData', '$location', function(userData, $location) {
  var vm = this;
  vm.user = {};
  vm.message = '';
  vm.reviews = [];

  // Get profile info
  userData.getProfile().then(function(res) {
    vm.user = res.data;
    vm.avatarPreview = vm.user.avatar || '/images/default-avatar.png';
  }).catch(function(err) {
    console.error(err);
  });

  // Get user's reviews
  userData.getUserReviews().then(function(res) {
    vm.reviews = res.data; // array of reviews with locationName
  }).catch(function(err) {
    console.error(err);
  });

  vm.goToUpdateProfile = function() {
    $location.path('/profile/edit');
  };

  // Delete review
  vm.deleteReview = function(locationId, reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    $http.delete('/api/locations/' + locationId + '/reviews/' + reviewId, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(function() {
      vm.reviews = vm.reviews.filter(r => r.reviewId !== reviewId);
      alert('Review deleted successfully');
    }).catch(function(err) {
      console.error(err);
      alert('Error deleting review');
    });
  };
}]);