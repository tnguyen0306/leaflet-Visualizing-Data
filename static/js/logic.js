// Creating map object
var myMap = L.map("map", {
    center: [40.52, -122.67],
    zoom: 4
  });
  
  // Adding tile layer to the map
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

// Create colorScale() function to get the color depending on the earthquake's magnitude
function colorScale(x) {
    return  x > 5 ? "#ff5f65" :
    x > 4 ? "#fca35d" :
    x > 3 ? "#fdb72a" :
    x > 2 ? "#f7db11" :
    x > 1 ? "#dcf400" :
    x > 0 ? "#a3f600" :
        "#FFEDA0"
  };

// Grab the data with d3
var url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(response) {
    // Create a GeoJSON layer
    function markerOptions(feature) {
        var markerOption = {
            radius: +feature.properties.mag*2,
            fillColor: colorScale(feature.properties.mag),
            color: "darkgreen",
            weight: 1,
            stroke: true,
            opacity: 1,
            fillOpacity: 0.8
      }
      return markerOption;
    };
  
    // Add the earthquake data to the map
    var geojson = L.geoJSON(response, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerOptions(feature));
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>" + feature.properties.place + "</h4>"+ "<hr> <h4>Magnitude: "+ +feature.properties.mag + "</h4>");
          }
    }).addTo(myMap);

});