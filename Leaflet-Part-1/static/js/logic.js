let coords = [39.550053, -105.782066]; //Colorado
let mapZoomLevel = 4;

// url for all earthquakes in past 7 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Creates map based on earthquake parameter
function createMap(earthquakes) {

    let world = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

    let baseMaps = {
        "Map": world
    };
    
    let overlayMaps = {
        "Earthquakes": earthquakes
    };
    
    let myMap = L.map("map", {
        center: coords,
        zoom: mapZoomLevel,
        layers: [world, earthquakes]
    });
    
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

    createLegend(myMap);
}

// Creates markers for each Earthquake datapoint
function createMarkers(response) {

    let features = response.features;

    let quakeMarkers = [];

    for (let i = 0; i < features.length; i++) {
        let feature = features[i];
        let coords = feature.geometry.coordinates;
        let properties = feature.properties;

        let quakeMarker = L.circleMarker([coords[1], coords[0]], {
            radius: markerSize(properties.mag),
            fillColor: markerColor(coords[2]),
            color: "#000", 
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h3>${properties.place}</h3>
                <hr>
                <p>Magnitude: ${properties.mag}</p>
                <p>Depth: ${coords[2]} km</p>
                <p>Date: ${new Date(properties.time)}</p>`);

        quakeMarkers.push(quakeMarker);
    }

    let earthquakes = L.layerGroup(quakeMarkers);

    createMap(earthquakes);
}

// Determines marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 4;
}

// Determines marker color based on depth
function markerColor(depth) {
    return depth > 90 ? "#ff0000" : //red
           depth > 70 ? "#ff6600" : //orange
           depth > 50 ? "#ffcc00" : //yellow
           depth > 30 ? "#ccff00" : //yellowgreen
           depth > 10 ? "#66ff00" : //green
                        "#00ffbb"; //greenblue
}

// Creates legend for the map
function createLegend(myMap) {
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90]; // Depth categories
        let labels = []; // Store legend items

        div.innerHTML += "<h4>Depth (km)</h4>"; // Title

        // Loop through depth intervals and generate labels with color boxes
        for (let i = 0; i < depths.length; i++) {
            let from = depths[i];
            let to = depths[i + 1];

            labels.push(
                `<div class="legend-item">
                    <i style="background:${markerColor(from + 1)}"></i> 
                    ${from}${to ? ` – ${to}` : "+"} km
                </div>`
            );
        }

        // Add all legend items to the div
        div.innerHTML += labels.join("");
        return div;
    };

    legend.addTo(myMap);
}

// Fetch GeoJSON data and create markers
d3.json(queryUrl)
.then(createMarkers)
.catch(error => console.error("Error fetching earthquake data:", error));