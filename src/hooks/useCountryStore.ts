import type { Feature } from "geojson";
import type { LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData } from "src/controllers/MapController";
import {
  getCountryGeometry,
  getCountryData,
} from "src/controllers/MapController";
import { useMapContext } from "src/contexts/MapContext";

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function getCountryCoordinates(country: CountryData) {
  if (!country) return null;
  return [country.latitude, country.longitude] as LatLngTuple;
}

/**
 * Normalizes a name by removing diacritics and trimming whitespace.
 */
function normalizeName(text?: string) {
  return text
    ?.trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function useCountryStore() {
  const { storedCountry, setStoredCountry } = useMapContext();
  const [countryFeature, setCountryFeature] = useState<Feature>();

  function getRandomCountryData(): CountryData {
    const { country, countryIndex } = getCountryData(randomIndex);

    if (!country) throw new Error(`No country found for index ${countryIndex}`);

    const feature = getCountryGeometry(country.alpha3);

    if (feature) setCountryFeature(feature);
    else throw new Error(`No feature found for ${country.name}`);

    setStoredCountry(country);

    return country;
  }

  function getSpecificCountryData(alpha3: string) {
    const { country } = getCountryData(alpha3);

    if (!country)
      throw new Error(`No country found for country code ${alpha3}`);

    const feature = getCountryGeometry(country.alpha3);

    if (feature) setCountryFeature(feature);
    else throw new Error(`No feature found for ${alpha3}`);

    setStoredCountry(country);

    return country;
  }

  const compareStoredCountry = (countryName: string) => {
    const correctAnswer = storedCountry?.name || "";
    const inputMatchesAnswer =
      normalizeName(countryName) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  const resetStore = () => setStoredCountry(null);

  return {
    countryStored: {
      data: storedCountry,
      feature: countryFeature,
      coordinates: getCountryCoordinates(storedCountry),
    },
    getRandomCountryData,
    getSpecificCountryData,
    compareStoredCountry,
    resetStore,
  };
}
