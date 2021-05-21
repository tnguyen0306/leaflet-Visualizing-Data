var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";


// Create creatMap function to add tile layers to the map
function createMap(earthquakes, faultLines) {
    
    // Create satellite tile layer
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
      });

    // Create outdoor tile layer
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
      });

    // Create grayscale tile layer
    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
      });

    // Create baseMaps to hold the tile layers
    var baseMaps = {
        "Satellite": satellite,
        "Outdoors": outdoors,
        "Grayscale": grayscale
    };
    
    // Create overlayMaps to hold overlay maps (Earthquakes and Fault Lines)
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines" : faultLines
    };

    // Create myMap with tile layers
    var myMap = L.map("map", {
        center: [40.52, -100.67],
        zoom: 4.5,
        layers : [satellite, outdoors, grayscale]
    });

    // Add tile layers, overlay maps to map; collapse on opening page
    myMap.addLayer(earthquakes);
    myMap.addLayer(faultLines);
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Call createLegend() to create legend
    createLegend(myMap)

    // Return the main map myMap
    return myMap;
}

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

// Create the points of interest on the map
function createPOI(response) {      
    
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
    
    // Create earthquakes layer
    var earthquakes = L.geoJSON(response, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerOptions(feature));
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>" + feature.properties.place + "</h4>"+ "<hr> <h4>Magnitude: "+ +feature.properties.mag + "</h4>" + "<r> <h4>Depth: "+ +feature.geometry.coordinates[2] + "</h4>");
          }
    });
    
    // Create faultLines layer
    d3.json(platesURL).then(response => {
        var faultLines = L.geoJSON(response, {
            style : {
                color: 'orange',
                fillColor: 'none',
                opacity: 1,
                stroke: true
            }
        })
        
        // Call createMap() function to add layers 
        var myMap = createMap(earthquakes,faultLines);
    });

};

// Function createLegend to create legend
function createLegend(myMap) {
    
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

    // Legend for fault lines
    var legend2 = L.control({position: 'bottomright'});
        
    legend2.onAdd = function(map) {
        var div2 = L.DomUtil.create('div','info legend');
        div2.innerHTML +=  "<ul class='legend'><li>Fault Lines</li></ul>"
        return div2;
    };

    // Add legend based on which overlay the user selects
    myMap.on('overlayadd', function(eventLayer){
        if (eventLayer.name === 'Earthquakes') {
            myMap.addControl(legend);
            legend.addTo(myMap);
        } 
        else if (eventLayer.name === "Fault Lines") {
            yMap.addControl(legend2);
            legend2.addTo(myMap)
        }
    });
    myMap.on('overlayremove', function(eventLayer){
        if (eventLayer.name === 'Earthquakes'){
            myMap.removeControl(legend);
        } else if (eventLayer.name === "Fault Lines"){
            myMap.removeControl(legend2)
        }
    });

};

// Grab the data with d3
d3.json(url).then(response => {
    createPOI(response)
})