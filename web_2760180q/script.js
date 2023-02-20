// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoieWlhbnF1IiwiYSI6ImNsY3E5eHR1cjAzcnUzdmxodTV3eHBjbm4ifQ.iW52nTA67rloJElIppk7Jg";

const map = new mapboxgl.Map({
  container: "map", // container element id
  style: "mapbox://styles/yianqu/cleancczk000001oygw24gtad",
  center: [-4.25, 55.858],
  zoom: 16
});

//Should point to your own GEOJSON
const data_url =
  "https://api.mapbox.com/datasets/v1/yianqu/cle1wbva20llz20p8bykaen7o/features?access_token=pk.eyJ1IjoieWlhbnF1IiwiYSI6ImNsY3E5eHR1cjAzcnUzdmxodTV3eHBjbm4ifQ.iW52nTA67rloJElIppk7Jg";

map.on("load", () => {
  map.addLayer({
    id: "road",
    type: "circle",
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["number", ["get", "casualties"]],
        0,
        2,
        5,
        24
      ],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["number", ["get", "casualties"]],
        0,
        "#2DC4B2",
        1,
        "#3BB3C3",
        2,
        "#669EC4",
        3,
        "#8B88B6",
        4,
        "#A2719B",
        5,
        "#AA5E79"
      ],
      "circle-opacity": 0.8
    }
  });

  //Slider interaction code goes below
  document.getElementById("slider").addEventListener("input", (event) => {
    //Get the year value from the slider
    const year = parseInt(event.target.value);
    filterYear = ["==", ["get", "year"], year];
    map.setFilter("road", ["all", filterYear]);
    // update text in the UI
    document.getElementById("active-year").innerText = year;
  });

  //Radio button interaction code goes below
  document.getElementById("filters").addEventListener("change", (event) => {
    //Get the  value from the activated radio button
    const type = event.target.value;
    //You can check the returned type in the console.
    console.log(type);
    // update the map filter
    if (type == "all") {
      filterType = ["!=", ["get", "severity"], "placeholder"];
    } else if (type == "Serious") {
      filterType = ["==", ["get", "severity"], "Serious"];
    } else if (type == "Slight") {
      filterType = ["==", ["get", "severity"], "Slight"];
    } else {
      console.log("error");
    }

    //Set the filter
    map.setFilter("road", ["all", filterType]);
  });
});

map.on("click", (event) => {
  /*What should happen when something is clicked*/

  // If the user clicked on one of your markers, get its information.
  const features = map.queryRenderedFeatures(event.point, { data: data_url });
  if (!features.length) {
    return;
  }
  const feature = features[0];

  /* 
    Create a popup, specify its options 
    and properties, and add it to the map.
  */
  const popup = new mapboxgl.Popup({
    offset: [0, -15],
    className: "my-popup"
  })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      `<h3>Casualty: ${feature.properties.casualties}</h3>
    <p>Severity: ${feature.properties.severity}</p>
    <p>Number of vehicles: ${feature.properties.vehicles}</p>`
    )
    .addTo(map);
});

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
  proximity: {
    longitude: 55.8642,
    latitude: 4.2518
  } // Coordinates of Glasgow center
});

map.addControl(geocoder, "top-right");
map.addControl(new mapboxgl.NavigationControl(), "top-right");
map.setMinZoom(10);

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-right"
);