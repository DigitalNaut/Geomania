import proj4 from 'proj4';

/**
 * Projects a BBox ([xmin, ymin, xmax, ymax]) to a different Proj4 projection.
 * 
 * @example
 * projectBBox('EPSG:4326', 'EPSG:3857', [-180, -90, 180, 90])
 * 
 * @param {string} from The current projection. Defaults to WGS84
 * @param {string} to The target projection. Defaults to WGS84
 * @param {[number, number, number, number]} bbox The bbox
 * @returns {[number, number, number, number]} The projected bbox
 */
function projectBBox({ bbox, from = 'WGS84', to = 'WGS84'}) {
  const firstPair = proj4(from, to, bbox.slice(0, 2));
  const secondPair = proj4(from, to, bbox.slice(2, 4));
  return [...firstPair, ...secondPair];
}

export default {
  projectBBox,
};
