{
  const mapContainer = document.getElementById('map');

  if (mapContainer) {
    mapContainer.innerHTML = ''; 
    mapboxgl.accessToken = mapToken;

    let centerCoords = [77.5946, 12.9716]; 
    if (mapData.coordinates) {
      centerCoords = mapData.coordinates;
    } else if (mapData.features && mapData.features.length > 0) {
      centerCoords = mapData.features[0].geometry.coordinates;
    }

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centerCoords,
      zoom: mapData.coordinates ? 12 : 2
    });

    const createMarker = () => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      // The flip requires this specific nested structure
      el.innerHTML = `
        <div class="marker-inner">
          <div class="marker-front">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div class="marker-back">
            <i class="fa-solid fa-compass"></i>
          </div>
        </div>
      `;
      return el;
    };

    if (mapData.coordinates) {
      // Show Page Popup
      // Inside the mapData.coordinates check
const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`
        <div class="popup-card">
            <h6>${mapData.title}</h6>
            <p>📍 ${mapData.location}</p>
        </div>
    `);

      new mapboxgl.Marker(createMarker())
        .setLngLat(mapData.coordinates)
        .setPopup(popup)
        .addTo(map);
    } else if (mapData.features) {
      // Index Page Popups with the "View Listing" button
      mapData.features.forEach((feature) => {
      // Inside your mapData.features.forEach loop
const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`
        <div class="popup-card">
            <h6>${feature.properties.title}</h6>
            <p>📍 ${feature.properties.location}</p>
            <a href="/listings/${feature.properties.id}" class="view-link">View Details</a>
        </div>
    `);
        new mapboxgl.Marker(createMarker())
          .setLngLat(feature.geometry.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    }
  }
}