// Create satellite tile layer
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Create outdoor tile layer
var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

// Create grayscale tile layer
var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.dark",
    accessToken: API_KEY
});

// Create baseMaps to hold the tile layers
var baseMaps = {
    "Satellite" : satellite,
    "Outdoors" : outdoors,
    "Grayscale": grayscale
};

// Create myMap with tile layers
var myMap = L.map("map", {
    center: [40.52, -115.67],
    zoom: 5,
    layers : [satellite, outdoors, grayscale]
});


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

// Create faultLines layer
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
d3.json(platesURL).then(response => {
    var faultLines = L.geoJSON(response, {
        style : {
            color: 'orange',
            fillColor: 'none',
            opacity: 1,
            stroke: true
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>" + "Plate Name : " + feature.properties.PlateName + "</h3>");
        }
    })
    
    // Add the legend to myMap
    faultLines.addTo(myMap);
});


// Create overlayMaps to hold overlay maps (Earthquakes and Fault Lines)
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines" : faultLines,
};

// Add tile layers, overlay maps to map; collapse on opening page
L.control.layers(baseMaps, overlayMaps, {collapsed: true}).addTo(myMap);