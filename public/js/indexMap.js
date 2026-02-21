mapboxgl.accessToken = mapData.token;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [78.9629, 20.5937], // Default center (India example)
  zoom: 4
});

// Add markers dynamically
mapData.listings.features.forEach(feature => {
  const el = document.createElement("div");
  el.className = "custom-marker";

  el.innerHTML = `
    <div class="marker-inner">
      <i class="fa-solid fa-location-dot marker-front"></i>
      <i class="fa-solid fa-compass marker-back"></i>
    </div>
  `;

  const popup = new mapboxgl.Popup({ 
  offset: 25,
  closeButton: false
})
.setHTML(`
  <div class="popup-card">
    <h5 class="popup-title">${feature.properties.title}</h5>
    <p class="popup-location">📍 ${feature.properties.location}</p>
    <a href="/listings/${feature.properties.id}" class="popup-btn">
      View Listing
    </a>
  </div>
`);

  new mapboxgl.Marker(el)
    .setLngLat(feature.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);
});

// Auto-fit map to markers
const bounds = new mapboxgl.LngLatBounds();

mapData.listings.features.forEach(feature => {
  bounds.extend(feature.geometry.coordinates);
});

map.fitBounds(bounds, {
  padding: 50,
  maxZoom: 10,
  duration: 1000
});