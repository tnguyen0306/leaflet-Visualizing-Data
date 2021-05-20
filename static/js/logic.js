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
    return  x > 90 ? "#ff5f65" :
    x > 70 ? "#fca35d" :
    x > 50 ? "#fdb72a" :
    x > 30 ? "#f7db11" :
    x > 10 ? "#dcf400" :
    x > -10 ? "#a3f600" :
        "#FFEDA0"
  };

// Grab the data with d3
var url ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(response) {
    // Create a GeoJSON layer
    function markerOptions(feature) {
        var markerOption = {
            radius: +feature.properties.mag*3,
            fillColor: colorScale(feature.geometry.coordinates[2]),
            color: "darkgreen",
            weight: 1,
            stroke: true,
            opacity: 1,
            fillOpacity: 0.8
      }
      return markerOption;
    };
  
    // Add the earthquake data to the map
    L.geoJSON(response, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerOptions(feature));
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>" + feature.properties.place + "</h4>"+ "<hr> <h4>Magnitude: "+ +feature.properties.mag + "</h4>" + "<r> <h4>Depth: "+ +feature.geometry.coordinates[2] + "</h4>");
          }
    }).addTo(myMap);

    // Create legend of earthquake magnitudes
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div','legend');
        var depth = [-10,10,30,50,70,90];
        var labels = [];

            // Loop through data to push the label of each info
            for (var i=0; i < depth.length; i++){
                if (i===5) {
                    labels.push("<tr><td style = 'text-align: center; padding:3px; margin:3px; background-color:" + colorScale(depth[i]) + "'>" + depth[i] + '+' + "</td></tr>");
                } 
                else {
                    labels.push("<tr><td style = 'text-align: center; padding:3px; margin:3px; background-color:" + colorScale(depth[i]) + "'>" + depth[i] + '-' + depth[i+1] + "</td></tr>");
                }
            }
        div.innerHTML += "<table style ='background-color: white; border-radius: 4px'><th'></th>" + labels.join("") + "</table>";
        
        return div;    
    };
    // Add the legend to myMap
    legend.addTo(myMap);

});