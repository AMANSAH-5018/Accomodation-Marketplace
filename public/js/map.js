
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker()
    .setLngLat([12.554729, 55.70651])  // listing.geometry.coordinates
    .addTo(map);