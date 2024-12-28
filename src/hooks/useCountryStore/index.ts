import { useCallback, useEffect, useState } from "react";

import { useCountryFilters } from "src/hooks/useCountryFilters";
import type { CountryDataList, NullableCountryData } from "src/types/features";
import { getCountryCoordinates, normalizeName } from "src/utils/features";
import { useCountryStoreContext } from "./context";

export function useCountryStore() {
  const { filteredCountryData } = useCountryFilters();
  const { storedCountry, setStoredCountry } = useCountryStoreContext();

  const resetWorkingList = useCallback(() => [...filteredCountryData], [filteredCountryData]);

  const [pendingCountries, setPendingCountries] = useState<CountryDataList>(resetWorkingList);

  useEffect(() => {
    setPendingCountries([...filteredCountryData]);
  }, [filteredCountryData]);

  const setCountryData = useCallback(
    (pendingIndex: number) => {
      const country = pendingCountries[pendingIndex];

      setStoredCountry(country);
      setPendingCountries((prevList) => {
        const newList = prevList.toSpliced(pendingIndex, 1);

        // If there are no more countries left, reset the list
        if (newList.length === 0) return resetWorkingList();

        return newList;
      });

      return country;
    },
    [pendingCountries, resetWorkingList, setStoredCountry],
  );

  const setCountryDataNext = useCallback((): NullableCountryData => {
    if (pendingCountries.length === 0) return null;

    const countryIndex = pendingCountries.findIndex((country) => country?.GU_A3 === storedCountry?.GU_A3);
    const nextIndex = (countryIndex + 1) % pendingCountries.length;

    return setCountryData(nextIndex);
  }, [pendingCountries, setCountryData, storedCountry?.GU_A3]);

  const setCountryDataRandom = useCallback((): NullableCountryData => {
    if (pendingCountries.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * pendingCountries.length);

    return setCountryData(randomIndex);
  }, [pendingCountries.length, setCountryData]);

  const setCountryDataByCode = useCallback(
    (a3?: string): NullableCountryData => {
      if (pendingCountries.length === 0 || !a3) return null;

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
    },
    [filteredCountryData, pendingCountries, setCountryData, setStoredCountry],
  );

  const compareStoredCountry = useCallback(
    (countryName: string) => {
      if (!storedCountry || !storedCountry.GEOUNIT) return false;

      const correctAnswer = storedCountry.GEOUNIT;
      const inputMatchesAnswer = normalizeName(countryName) === normalizeName(correctAnswer);

      return inputMatchesAnswer;
    },
    [storedCountry],
  );

  const resetStore = useCallback(() => {
    setStoredCountry(null);
    setPendingCountries(resetWorkingList());
  }, [resetWorkingList, setStoredCountry]);

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

export { CountryStoreProvider } from "./Provider";
