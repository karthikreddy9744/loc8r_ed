(function() {
  'use strict';

  angular.module('loc8rApp')
    .controller('locationFormCtrl', [
      '$routeParams', 'loc8rData', '$location',
      function($routeParams, loc8rData, $location) {
        var vm = this;
        vm.isEdit = !!$routeParams.locationid;

        // Default location
        vm.location = {
          name: '',
          address: '',
          facilities: '',
          rating: 0,
          coords: { type: 'Point', coordinates: [78.486671, 17.385044] }, // Hyderabad default
          openingTimes: []
        };

        vm.message = '';

        // Load location for editing
        if (vm.isEdit) {
          loc8rData.getLocationById($routeParams.locationid)
            .then(function(res) {
              vm.location = res.data;

              // Ensure coords exist
              if (!vm.location.coords || !Array.isArray(vm.location.coords.coordinates) || vm.location.coords.coordinates.length !== 2) {
                vm.location.coords = { type: 'Point', coordinates: [78.486671, 17.385044] };
              }

              // Ensure openingTimes array exists
              if (!Array.isArray(vm.location.openingTimes)) vm.location.openingTimes = [];
            })
            .catch(function(err) {
              vm.message = 'Error loading location';
              console.error(err);
            });
        }

        // Add a new opening time row
        vm.addOpeningTime = function() {
          vm.location.openingTimes.push({ days: '', opening: '', closing: '', closed: false });
        };

        // Remove an opening time row
        vm.removeOpeningTime = function(index) {
          vm.location.openingTimes.splice(index, 1);
        };

        // Save location
        vm.saveLocation = function() {
          if (!vm.location.name || !vm.location.address) {
            vm.message = 'Name and Address are required';
            return;
          }

          // Validate coordinates
          if (!vm.location.coords || !Array.isArray(vm.location.coords.coordinates) || vm.location.coords.coordinates.length !== 2) {
            vm.message = 'Please select a location on the map';
            return;
          }

          const lng = parseFloat(vm.location.coords.coordinates[0]);
          const lat = parseFloat(vm.location.coords.coordinates[1]);

          if (isNaN(lat) || isNaN(lng)) {
            vm.message = 'Invalid coordinates. Please pin the location on the map.';
            return;
          }

          // Convert facilities to array
         const facilities = Array.isArray(vm.location.facilities)
          ? vm.location.facilities.join(',') 
          : vm.location.facilities || '';

          // Ensure openingTimes exist
          const openingTimes = Array.isArray(vm.location.openingTimes)
            ? vm.location.openingTimes
            : [];

          // Prepare payload for backend
          const locationData = {
            name: vm.location.name,
            address: vm.location.address,
            rating: vm.location.rating || 0,
            facilities,
            lat,
            lng,
            openingTimes
          };

          // Call add or update
          const action = vm.isEdit
            ? loc8rData.updateLocation($routeParams.locationid, locationData)
            : loc8rData.addLocation(locationData);

          action.then(() => {
            $location.path('/');
          }).catch(err => {
            vm.message = 'Error saving location';
            console.error(err);
          });
        };
      }
    ]);
})();