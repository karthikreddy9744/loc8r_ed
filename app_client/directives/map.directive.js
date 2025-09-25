(function () {
  'use strict';

  angular
    .module('loc8rApp')
    .directive('leafletMap', ['$timeout', function($timeout){
      return {
        restrict:'E',
        scope:{ vmCtrl:'=', locations:'=' },
        template:'<div class="map-container" style="width:100%; height:100%; min-height:300px;"></div>',
        link:function(scope, element){
          var mapDiv = element[0].children[0];
          var map = null;
          var markerGroup = null;

          // Icons
          var myLocationIcon = L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize:[32,32],
            iconAnchor:[16,32]
          });
          var restaurantIcon = L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/149/149059.png',
            iconSize:[32,32],
            iconAnchor:[16,32]
          });
          var highlightIcon = L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize:[40,40],
            iconAnchor:[20,40],
            className:'marker-highlight'
          });

          function initMap(center){
            map = L.map(mapDiv).setView(center, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
              attribution:'&copy; OpenStreetMap contributors'
            }).addTo(map);
            markerGroup = L.layerGroup().addTo(map);
          }

          function updateMap(centerLat, centerLng, locationsArray){
            if(!map) initMap([centerLat, centerLng]);
            else markerGroup.clearLayers();

            // User marker (center)
            if(centerLat && centerLng){
              L.marker([centerLat, centerLng], {icon:myLocationIcon})
                .bindPopup('You are here').addTo(markerGroup);
            }

            // Locations markers
            if(locationsArray && locationsArray.length){
              locationsArray.forEach(r => {
                var coords = r.coords?.coordinates || r.coordinates?.coordinates || r.location?.coordinates;
                if(!coords) return;
                var marker = L.marker([coords[1], coords[0]], {icon:restaurantIcon})
                  .bindPopup('<b>'+ (r.name||'') +'</b><br>'+ (r.address||''));
                marker.on('click', function(){
                  markerGroup.eachLayer(l=>{
                    if(l.setIcon) l.setIcon(restaurantIcon);
                    if(l.closePopup) l.closePopup();
                  });
                  marker.setIcon(highlightIcon);
                  marker.openPopup();
                });
                marker.addTo(markerGroup);
                r._marker = marker;
              });
            }

            // Draggable marker for form pages
            if(scope.vmCtrl){
              var locObj = scope.vmCtrl.location || null;

              // If vmCtrl is a literal object with lat/lng, override
              var lat = locObj?.coords?.coordinates ? locObj.coords.coordinates[1] : scope.vmCtrl.lat || centerLat;
              var lng = locObj?.coords?.coordinates ? locObj.coords.coordinates[0] : scope.vmCtrl.lng || centerLng;

              if(lat && lng && locObj){
                var dragMarker = L.marker([lat,lng], {draggable:true, icon:myLocationIcon})
                  .addTo(markerGroup)
                  .bindPopup('Drag to set location');

                dragMarker.on('dragend', function(){
                  var pos = dragMarker.getLatLng();
                  locObj.coords = { type:'Point', coordinates:[pos.lng,pos.lat] };
                  scope.$apply();
                });

                scope.vmCtrl._marker = dragMarker;
                map.setView([lat,lng], 13);
              }
            }
          }

          // Watch for updates
          scope.$watchGroup(['vmCtrl', 'locations'], function(newVals){
            var ctrl = newVals[0];
            var locs = newVals[1] || [];

            var lat = (ctrl?.location?.coords?.coordinates) ? ctrl.location.coords.coordinates[1] : ctrl?.lat;
            var lng = (ctrl?.location?.coords?.coordinates) ? ctrl.location.coords.coordinates[0] : ctrl?.lng;

            if(lat && lng) updateMap(lat, lng, locs);
          }, true);

          // Listen to broadcasts
          scope.$on('map:updateMarkers', function(evt,data){
            if(data.userLocation && data.restaurants){
              updateMap(data.userLocation.lat, data.userLocation.lng, data.restaurants);
            }
          });
        }
      };
    }]);
})();