import type { Feature, GeoJsonObject } from "geojson";

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
    ({ properties }) => properties["ISO_A3"] === alpha3
  );

  if (feature) return feature as Feature;
  return null;
}

type CountryInfo = {
  countryIndex: number;
  country: CountryData;
};

/**
 * Gets the next country to be displayed from the list of countries in the metadata.
 * @param indexCallback Whether to get a random country or the first country in the list.
 * @param callback A callback function to be called after the country is retrieved.
 * @returns The country index, country data, and country coordinates.
 */
export function getCountryData(
  indexCallback: string | number | ((length: number) => number)
): CountryInfo {
  const countryIndex =
    typeof indexCallback === "function"
      ? indexCallback(countriesMetadata.length)
      : typeof indexCallback === "string"
      ? countriesMetadata.findIndex(({ alpha3 }) => alpha3 === indexCallback)
      : indexCallback;

  const country: CountryData = countriesMetadata[countryIndex];

  return { countryIndex, country };
}

/**
 * Gets all the country features from the country geometries data.
 * @returns The country features.
 */
export function getAllCountryFeatures() {
  return countryGeometries as GeoJsonObject;
}

export function getAllCountriesMetadata() {
  return countriesMetadata.sort(({ name: nameA }, { name: nameB }) =>
    nameA.localeCompare(nameB)
  ) as CountryData[];
}