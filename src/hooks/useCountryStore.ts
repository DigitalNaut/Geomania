import type { LatLngTuple } from "leaflet";

import { useCountryStoreContext } from "src/contexts/CountryStoreContext";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import countriesMetadata from "src/assets/data/country-metadata.json";

export type CountryData = (typeof countriesMetadata)[number];

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function normalizeName(text?: string) {
  return text
    ?.trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function getCountryCoordinates(country: CountryData) {
  return [country.lat, country.lon] as LatLngTuple;
}

export function useCountryStore() {
  const { storedCountry, setStoredCountry } = useCountryStoreContext();
  const {
    continentFilters,
    toggleContinentFilter,
    countryDataByContinent,
    filteredCountryData,
    resetContinentFilters,
  } = useCountryFiltersContext();

  function getNextCountryData(): CountryData | null {
    if (!filteredCountryData.length) return null;

    const countryIndex = filteredCountryData.findIndex((country) => country?.a3 === storedCountry?.a3);
    const country = filteredCountryData[(countryIndex + 1) % filteredCountryData.length];

    if (!country) throw new Error(`No country found for index ${countryIndex}`);

    setStoredCountry(country);

    return country;
  }

  function getRandomCountryData(): CountryData | null {
    if (!filteredCountryData.length) return null;

    const countryIndex = randomIndex(filteredCountryData.length);
    const country = filteredCountryData[countryIndex];

    if (!country) throw new Error(`No country found for index ${countryIndex}`);

    setStoredCountry(country);

    return country;
  }

  function getCountryDataByCode(a3?: string): CountryData | null {
    if (!filteredCountryData.length || !a3) return null;

    const country = countriesMetadata.find((country) => country.a3 === a3);

    if (!country) throw new Error(`No country found for country code ${a3}`);

    setStoredCountry(country);

    return country;
  }

  const compareStoredCountry = (countryName: string) => {
    const correctAnswer = storedCountry?.name || "";
    const inputMatchesAnswer = normalizeName(countryName) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  const resetStore = () => setStoredCountry(null);

  return {
    storedCountry: {
      data: storedCountry,
      coordinates: storedCountry ? getCountryCoordinates(storedCountry) : null,
    },
    getNextCountryData,
    getRandomCountryData,
    getCountryDataByCode,
    compareStoredCountry,
    setStoredCountry,
    resetStore,
    toggleContinentFilter,
    continentFilters,
    countryDataByContinent,
    filteredCountryData,
    resetContinentFilters,
  };
}
