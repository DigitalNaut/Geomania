import type { LatLngTuple } from "leaflet";
import { useMemo, useState } from "react";

import { useCountryStoreContext } from "src/contexts/CountryStoreContext";
import continents from "src/data/continents.json";
import countriesMetadata from "src/data/country-metadata.json";

export type CountryData = (typeof countriesMetadata)[number];
export type CountriesDataByContinent = Record<string, CountryData[]>;
type CountryFilters = Record<string, boolean>;

const allCountriesMetadata = countriesMetadata as CountryData[];

const sortCountriesDataByContinent = () =>
  allCountriesMetadata.reduce((groups, country) => {
    const { continent } = country || {};

    if (continent) {
      if (groups[continent]) groups[continent].push(country);
      else groups[continent] = [country];
    }
    return groups;
  }, {} as CountriesDataByContinent);

function useCountryData() {
  const [continentFilters, setContinentFilters] = useState(() =>
    continents.reduce((continents, continent) => {
      continents[continent] = true;
      return continents;
    }, {} as CountryFilters)
  );

  const filteredCountryData = useMemo(
    () =>
      allCountriesMetadata.filter((country) => {
        const { continent } = country || {};
        return continent && continentFilters[continent];
      }),
    [continentFilters]
  );

  const countryDataByContinent = useMemo(() => {
    return sortCountriesDataByContinent();
  }, []);

  const toggleContinentFilter = (continent: string, toggle: boolean) => {
    setContinentFilters((currentFilters) => ({
      ...currentFilters,
      [continent]: toggle,
    }));
  };

  return {
    toggleContinentFilter,
    continentFilters,
    countryDataByContinent,
    filteredCountryData,
  };
}

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
  return [country.latitude, country.longitude] as LatLngTuple;
}

export function useCountryStore() {
  const { storedCountry, setStoredCountry } = useCountryStoreContext();
  const {
    toggleContinentFilter,
    countryDataByContinent,
    filteredCountryData,
    continentFilters,
  } = useCountryData();

  function getNextCountryData(): CountryData | null {
    if (!filteredCountryData.length) return null;

    const countryIndex = filteredCountryData.findIndex(
      (country) => country?.alpha3 === storedCountry?.alpha3
    );
    const country =
      filteredCountryData[(countryIndex + 1) % filteredCountryData.length];

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

  function getCountryDataByCode(alpha3?: string): CountryData | null {
    if (!filteredCountryData.length || !alpha3) return null;

    const country = countriesMetadata.find(
      (country) => country.alpha3 === alpha3
    );

    if (!country)
      throw new Error(`No country found for country code ${alpha3}`);

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
  };
}
