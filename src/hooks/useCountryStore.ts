import { useEffect, useState } from "react";
import { type LatLngTuple } from "leaflet";

import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import { useCountryStoreContext } from "src/contexts/CountryStoreContext";
import type featuresData from "src/assets/data/features-data.json";

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

  const resetWorkingList = () => [...filteredCountryData];

  const [pendingCountries, setPendingCountries] = useState<CountryDataList>(resetWorkingList);

  useEffect(() => {
    setPendingCountries([...filteredCountryData]);
  }, [filteredCountryData]);

  function setCountryData(pendingIndex: number) {
    const country = pendingCountries[pendingIndex];

    setStoredCountry(country);
    setPendingCountries((prevList) => {
      const newList = prevList.toSpliced(pendingIndex, 1);

      // If there are no more countries left, reset the list
      if (!newList.length) return resetWorkingList();

      return newList;
    });

    return country;
  }

  function setCountryDataNext(): NullableCountryData {
    if (!pendingCountries.length) return null;

    const countryIndex = pendingCountries.findIndex((country) => country?.GU_A3 === storedCountry?.GU_A3);
    const nextIndex = (countryIndex + 1) % pendingCountries.length;

    return setCountryData(nextIndex);
  }

  function setCountryDataRandom(): NullableCountryData {
    if (!pendingCountries.length) return null;

    const randomIndex = Math.floor(Math.random() * pendingCountries.length);

    return setCountryData(randomIndex);
  }

  function setCountryDataByCode(a3?: string): NullableCountryData {
    if (!pendingCountries.length || !a3) return null;

    // If the country is already in the pending list, use it
    const pendingIndex = pendingCountries.findIndex((country) => country.GU_A3 === a3);
    if (pendingIndex !== -1) return setCountryData(pendingIndex);

    // If the country is not in the pending list, just set it as the stored country
    const country = filteredCountryData.find((country) => country.GU_A3 === a3);
    if (country) {
      setStoredCountry(country);
      return country;
    }

    return null;
  }

  const compareStoredCountry = (countryName: string) => {
    if (!storedCountry || !storedCountry.GEOUNIT) return false;

    const correctAnswer = storedCountry.GEOUNIT;
    const inputMatchesAnswer = normalizeName(countryName) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  const resetStore = () => {
    setStoredCountry(null);
    resetWorkingList();
  };

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
