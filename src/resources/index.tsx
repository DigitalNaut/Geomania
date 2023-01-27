export const OSM_TILEMAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAPBOX_TILEMAP_URL = `https://api.mapbox.com/styles/v1/${123}/${123}/tiles/256/{z}/{x}/{y}@2x?access_token=${123}`;

export default {
  mapUrlOSM: OSM_TILEMAP_URL,
  mapUrlMapbox: MAPBOX_TILEMAP_URL,
};
