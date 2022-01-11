//SRC: https://stackoverflow.com/questions/51033188/how-to-use-supercluster 

var map = L.map('map').setView([0, 0], 0);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Empty Layer Group that will receive the clusters data on the fly.
var markers = L.geoJSON(null, {
  pointToLayer: createClusterIcon,
  onEachFeature: function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.id) {
            layer.bindPopup("<b>"+feature.properties.id+"</b>");
        }
    }

}).addTo(map);

// Update the displayed clusters after user pan / zoom.
map.on('moveend', update);

function update() {
  if (!ready) return;
  var bounds = map.getBounds();
  var bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
  var zoom = map.getZoom();
  var clusters = index.getClusters(bbox, zoom);
  markers.clearLayers();
  markers.addData(clusters);
}

// Zoom to expand the cluster clicked by user.
markers.on('click', function(e) {
  var clusterId = e.layer.feature.properties.cluster_id;
  var center = e.latlng;
  var expansionZoom;
  if (clusterId) {
    expansionZoom = index.getClusterExpansionZoom(clusterId);
    map.flyTo(center, expansionZoom);
  }
});

// Retrieve Points data.
const generateMarkers = (count) => {
    const southWest = new L.latLng(39.60463011823322, -105.0667190551758);
    const northEast = new L.latLng(39.68393975392733, -104.90947723388673);
    const bounds = new L.latLngBounds(southWest, northEast);
  
    const minLat = bounds.getSouthWest().lat,
      rangeLng = bounds.getNorthEast().lat - minLat,
      minLng = bounds.getSouthWest().lng,
      rangeLat = bounds.getNorthEast().lng - minLng;
  
    const result = {};
    result.features = Array.from({ length: count }, (v, k) => {
      return {
        type: "Feature",
        properties:{
            id: k,
        },
        geometry:{
            type:"Point",
            coordinates: [minLng + Math.random() * rangeLat, minLat + Math.random() * rangeLng]
        },
      };
    });
    return result;
  };
  
const geojson = generateMarkers(500000);
//var placesUrl = 'https://cdn.rawgit.com/mapbox/supercluster/v4.0.1/test/fixtures/places.json';
//var index;
//var ready = false;
index = supercluster({
    radius: 60,
    extent: 256,
    maxZoom: 18
  }).load(geojson.features); // Expects an array of Features.
  ready = true;
  update();


function createClusterIcon(feature, latlng) {
  if (!feature.properties.cluster) {return L.marker(latlng);console.log(latlng)}

  var count = feature.properties.point_count;
  var size =
    count < 100 ? 'small' :
    count < 1000 ? 'medium' : 'large';
  var icon = L.divIcon({
    html: '<div><span>' + feature.properties.point_count_abbreviated + '</span></div>',
    className: 'marker-cluster marker-cluster-' + size,
    iconSize: L.point(40, 40)
  });

  return L.marker(latlng, {
    icon: icon
  });
}

