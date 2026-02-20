mapboxgl.accessToken = mapData.token;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: mapData.coordinates,
  zoom: 10
});

// Create popup
const popup = new mapboxgl.Popup({
  offset: 25,
  closeButton: false
}).setHTML(`
  <div class="custom-popup">
    <h5 class="popup-title">${mapData.title}</h5>
    <p class="popup-location">📍 ${mapData.location}</p>
  </div>
`);

// Create marker container
const el = document.createElement("div");
el.className = "custom-marker";

// Add two icons inside (pin + compass)
el.innerHTML = `
  <div class="marker-inner">
    <i class="fa-solid fa-location-dot marker-front"></i>
    <i class="fa-solid fa-compass marker-back"></i>
  </div>
`;

// Add marker
new mapboxgl.Marker(el)
  .setLngLat(mapData.coordinates)
  .setPopup(popup)
  .addTo(map);