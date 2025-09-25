(function() {
  'use strict';

  angular.module('loc8rApp')
    .service('loc8rData', ['$http', '$q', function($http, $q) {
      var apiBase = '/api';

      // -------- LOCATIONS CRUD --------
      this.getLocations = function() {
        return $http.get(apiBase + '/locations')
          .catch(function() {
            return $http.get('/data/locations.json');
          });
      };

      this.getLocationById = function(locationid) {
        return $http.get(apiBase + '/locations/' + locationid)
          .catch(function() {
            return $http.get('/data/locations.json').then(function(res) {
              var found = res.data.find(l => l._id === locationid);
              return { data: found };
            });
          });
      };

      this.addLocation = function(locationData) {
        return $http.post(apiBase + '/locations', locationData)
          .catch(function() { return $q.resolve({ data: locationData }); });
      };

      this.updateLocation = function(locationid, locationData) {
        return $http.put(apiBase + '/locations/' + locationid, locationData)
          .catch(function() { return $q.resolve({ data: locationData }); });
      };

      this.deleteLocation = function(locationid) {
        return $http.delete(apiBase + '/locations/' + locationid)
          .catch(function() { return $q.resolve({}); });
      };

      // -------- REVIEWS CRUD --------
      this.addReview = function(locationid, reviewData) {
        return $http.post(apiBase + '/locations/' + locationid + '/reviews', reviewData)
          .catch(function() { return $q.resolve({ data: reviewData }); });
      };

      this.getReview = function(locationid, reviewid) {
        return $http.get(apiBase + '/locations/' + locationid + '/reviews/' + reviewid)
          .catch(function() { return $q.reject({ message: 'Review not found (mock)' }); });
      };

      this.updateReview = function(locationid, reviewid, reviewData) {
        return $http.put(apiBase + '/locations/' + locationid + '/reviews/' + reviewid, reviewData)
          .catch(function() { return $q.resolve({ data: reviewData }); });
      };

      this.deleteReview = function(locationid, reviewid) {
        return $http.delete(apiBase + '/locations/' + locationid + '/reviews/' + reviewid)
          .catch(function() { return $q.resolve({}); });
      };

      // -------- NEW: GET NEARBY RESTAURANTS --------
      this.getLocationsByCoords = function (lat, lng, maxDistance) { 
        return $http.get(apiBase + '/locations', {
          params: {
            lat: lat,
            lng: lng,
            maxDistance: maxDistance
          }
        })
        .catch(function() {
          return $http.get('/data/locations.json').then(function(res) {
            // mock filtering by distance (not accurate, just for demo)
            var locations = res.data || [];
            var filtered = locations.filter(function(loc) {
              if (!loc.coords || !Array.isArray(loc.coords.coordinates)) return false;
              var locLng = loc.coords.coordinates[0];
              var locLat = loc.coords.coordinates[1];
              var distance = Math.sqrt(Math.pow(locLat - lat, 2) + Math.pow(locLng - lng, 2)) * 111000; // rough conversion to meters
              return distance <= maxDistance;
            });
            return { data: filtered };
          });
        });
      };  

      this.getNearbyRestaurants = function(lat, lng, maxDistance) {
        return $http.get(apiBase + '/locations/nearby', {
          params: { lat: lat, lng: lng, maxDistance: maxDistance }
        }).catch(function() {
          // fallback: /data/locations.json -> compute distances on client
          return $http.get('/data/locations.json').then(function(res) {
            var raw = Array.isArray(res.data) ? res.data : (res.data.locations || []);
            if (!raw) return { data: [] };

            var R = 6371; // km
            var filtered = raw.map(function(l){
              // try different coordinate keys
              var coords = l.coords && l.coords.coordinates ? l.coords.coordinates :
                           l.coordinates && l.coordinates.coordinates ? l.coordinates.coordinates :
                           l.location && l.location.coordinates ? l.location.coordinates : null;
              if (!coords) return null;
              var dLat = (coords[1] - lat) * Math.PI/180;
              var dLng = (coords[0] - lng) * Math.PI/180;
              var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat * Math.PI/180) * Math.cos(coords[1]*Math.PI/180) * Math.sin(dLng/2)*Math.sin(dLng/2);
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              l.distance = R * c * 1000; // meters
              return l;
            }).filter(Boolean).filter(function(l){ return l.distance <= maxDistance; });

            return { data: filtered };
          });
        });
      };
    }]);
})();