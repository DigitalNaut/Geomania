import type { LatLngTuple } from "leaflet";
import type { Feature } from "geojson";

import countriesMetadata from "src/data/country-metadata.json";
import countryGeometries from "src/data/country-geometries.json";

export type CountryData = (typeof countriesMetadata)[number] | null;

/**
 * Gets the country geometry from the country geometries data.
 * @param alpha3 The country's alpha-3 code.
 * @returns The country geometry.
 */
export function getCountryGeometry(alpha3: string) {
  const feature = countryGeometries["features"].find(
    (feature) => feature["properties"]["ISO_A3"] === alpha3
  );

  if (feature) return feature as Feature;
  return null;
}

/**
 * Gets the next country to be displayed from the list of countries in the metadata.
 * @param index Whether to get a random country or the first country in the list.
 * @param callback A callback function to be called after the country is retrieved.
 * @returns The country index, country data, and country coordinates.
 */
export function getNewCountryData(index?: number) {
  const countryIndex =
    index ?? Math.floor(Math.random() * countriesMetadata.length);
  const country: CountryData = countriesMetadata[countryIndex];
  const countryCoords: LatLngTuple = [country.latitude, country.longitude];

  return { countryIndex, country, countryCoords };
}

/**
 * Gets all the country features from the country geometries data.
 * @returns The country features.
 */
export function getAllCountryFeatures() {
  return countryGeometries.features as Feature[];
}

export function getAllCountriesMetadata() {
  return countriesMetadata as CountryData[];
}
