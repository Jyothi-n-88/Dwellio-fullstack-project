mapboxgl.accessToken = mapData.token;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: mapData.coordinates,
  zoom: 10
});

new mapboxgl.Marker()
  .setLngLat(mapData.coordinates)
  .addTo(map);
