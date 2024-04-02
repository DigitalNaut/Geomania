import type { LatLngTuple } from "leaflet";

import type featuresData from "src/assets/data/features-data.json";
import { useCountryStoreContext } from "src/contexts/CountryStoreContext";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";

export type CountryDataList = typeof featuresData;
export type CountryData = CountryDataList[number];
export type NullableCountryData = CountryData | null;

function normalizeName(name?: string) {
  return name
    ?.trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function getCountryCoordinates(country: CountryData): LatLngTuple {
  const { LABEL_X, LABEL_Y } = country;
  if (LABEL_X && LABEL_Y) return [LABEL_Y, LABEL_X];
  else return [0, 0];
}

export function useCountryStore() {
  const { filteredCountryData } = useCountryFiltersContext();
  const { storedCountry, setStoredCountry } = useCountryStoreContext();

  function setCountryDataNext(): NullableCountryData {
    if (!filteredCountryData.length) return null;

    const countryIndex = filteredCountryData.findIndex((country) => country?.GU_A3 === storedCountry?.GU_A3);
    const country = filteredCountryData[(countryIndex + 1) % filteredCountryData.length];

    setStoredCountry(country);
    return country;
  }

  function setCountryDataRandom(): NullableCountryData {
    if (!filteredCountryData.length) return null;

    const randomIndex = Math.floor(Math.random() * filteredCountryData.length);
    const country = filteredCountryData[randomIndex];

    setStoredCountry(country);
    return country;
  }

  function setCountryDataByCode(a3?: string): NullableCountryData {
    if (!filteredCountryData.length || !a3) return null;

    const country = filteredCountryData.find((country) => country.GU_A3 === a3) ?? null;

    setStoredCountry(country);
    return country;
  }

  const compareStoredCountry = (countryName: string) => {
    if (!storedCountry || !storedCountry.GEOUNIT) return false;

    const correctAnswer = storedCountry.GEOUNIT;
    const inputMatchesAnswer = normalizeName(countryName) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  const resetStore = () => setStoredCountry(null);

  return {
    storedCountry: {
      data: storedCountry,
      coordinates: storedCountry ? getCountryCoordinates(storedCountry) : null,
    },
    setCountryDataNext,
    setCountryDataRandom,
    setCountryDataByCode,
    compareStoredCountry,
    resetStore,
  };
}
