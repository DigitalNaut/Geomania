import Leaflet from 'leaflet';

export const markerIcon = Leaflet.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});

export default { markerIcon };
