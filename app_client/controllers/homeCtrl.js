(function () {
  'use strict';

  angular
    .module('loc8rApp')
    .controller('homeCtrl', ['$scope', 'loc8rData', function ($scope, loc8rData) {
      var vm = this;
      vm.distance = 5000; // 5 km default
      vm.locations = [];
      vm.message = '';
      vm.lat = null;
      vm.lng = null;

      // Socket.IO connection
      var socket = io();

      // Request nearby restaurants via socket
      vm.requestNearby = function () {
        if (!vm.lat || !vm.lng) return;
        socket.emit('getNearby', { lng: vm.lng, lat: vm.lat, maxDistance: parseInt(vm.distance,10) });
      };

      // Focus map on a restaurant
      vm.focusOn = function(loc) {
        if (loc && loc._marker && vm._map) {
          vm._map.eachLayer(function(l){
            if(l.closePopup) l.closePopup();
          });
          vm._map.flyTo(loc._marker.getLatLng(), 16, { duration: 1.2 });
          loc._marker.openPopup();

          // Highlight marker
          if(vm._highlightedMarker && vm._highlightedMarker !== loc._marker){
            vm._highlightedMarker.setIcon(vm._restaurantIcon);
          }
          loc._marker.setIcon(vm._highlightIcon);
          vm._highlightedMarker = loc._marker;
        }
      };

      // Socket listeners
      socket.on('connect', function(){ $scope.$applyAsync(()=>{ vm.message=''; }); });

      socket.on('nearbyResults', function(data){
        $scope.$applyAsync(function(){
          vm.locations = Array.isArray(data) ? data : [];
          vm.message = vm.locations.length ? '' : 'No restaurants found';
          $scope.$broadcast('map:updateMarkers', {
            userLocation: { lat: vm.lat, lng: vm.lng },
            restaurants: vm.locations
          });
        });
      });

      socket.on('errorMsg', function(err){
        $scope.$applyAsync(function(){
          vm.message = (err && err.error) || 'Failed to fetch nearby restaurants';
        });
      });

      // Watch distance changes
      $scope.$watch(() => vm.distance, function(newVal, oldVal){
        if(newVal === oldVal) return;
        if(newVal<1000) vm.distance=1000;
        if(newVal>250000) vm.distance=250000;
        if(socket.connected) vm.requestNearby();
      });

      // Get user GPS
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
          $scope.$apply(function(){
            vm.lat = position.coords.latitude;
            vm.lng = position.coords.longitude;
            if(socket.connected) vm.requestNearby();
            else loc8rData.getNearbyRestaurants(vm.lat, vm.lng, vm.distance)
              .then(res => {
                vm.locations = res.data || [];
                $scope.$broadcast('map:updateMarkers', {
                  userLocation: { lat: vm.lat, lng: vm.lng },
                  restaurants: vm.locations
                });
              })
              .catch(()=> vm.message='Unable to fetch nearby restaurants');
          });
        }, function(){ vm.message='Enable GPS and allow location permission'; }, { enableHighAccuracy:true });
      } else vm.message='Geolocation not supported';
    }]);
})();