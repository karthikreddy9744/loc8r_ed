angular.module('loc8rApp')
.controller('profileEditCtrl', ['userData', '$scope', function(userData, $scope) {
  var vm = this;
  vm.user = {};
  vm.avatarPreview = '/images/default-avatar.png';
  vm.avatarFile = null;
  vm.message = '';

  // Load profile
  userData.getProfile().then(function(res) {
    Object.assign(vm.user, res.data);

    // Convert avatar buffer to base64
    vm.avatarPreview = vm.user.avatar && vm.user.avatar.data
      ? `data:${vm.user.avatar.contentType};base64,${vm.user.avatar.data}`
      : '/images/default-avatar.png';
  }).catch(function(err) {
    console.error(err);
  });

  // Preview avatar before uploading
  vm.previewAvatar = function(input) {
    if (input.files && input.files[0]) {
      vm.avatarFile = input.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        $scope.$apply(function() {
          vm.avatarPreview = e.target.result;
        });
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Update avatar
  vm.updateAvatar = function() {
    if (!vm.avatarFile) return alert('Please select an image!');

    userData.uploadAvatar(vm.avatarFile)
      .then(function(res) {
        vm.message = res.data.message;

        // Update preview with new avatar from MongoDB
        vm.avatarPreview = res.data.user.avatar && res.data.user.avatar.data
          ? `data:${res.data.user.avatar.contentType};base64,${res.data.user.avatar.data}`
          : '/images/default-avatar.png';

        vm.avatarFile = null;
      })
      .catch(function(err) {
        console.error(err);
      });
  };

  // Update profile info
  vm.updateProfile = function() {
    userData.updateProfile(vm.user)
      .then(function(res) {
        vm.message = res.data.message;
      })
      .catch(function(err) {
        console.error(err);
      });
  };

  vm.goToProfile = function() {
    window.location.href = '#!/profile';
  };
}]);