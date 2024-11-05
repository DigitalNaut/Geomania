import type featuresData from "src/assets/data/features/countries.json";

export type CountryDataList = typeof featuresData;
export type CountryData = CountryDataList[number];
export type NullableCountryData = CountryData | null;