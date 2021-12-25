export const OSM_TILEMAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAPBOX_TILEMAP_URL = `https://api.mapbox.com/styles/v1/${process.env.REACT_APP_MAPBOX_USER}/${process.env.REACT_APP_MAPBOX_MAP_SATELLITE_STYLE}/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_DEV_PK}`;

export default {
  mapUrlOSM: OSM_TILEMAP_URL,
  mapUrlMapbox: MAPBOX_TILEMAP_URL,
};
