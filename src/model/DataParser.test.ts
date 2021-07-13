import mapData from "data/countries.json";
import { getCountryNames } from "./DataParser";

test('JSON data must have features attribute', () => {
  expect(mapData).toBeDefined();
  expect(mapData.features).toBeDefined();
});

test('extracts a list of countries from JSON', () => {
  let countryNames = getCountryNames(mapData.features);
  expect(countryNames.length).toBe(255);

  countryNames = getCountryNames([]);
  expect(countryNames.length).toBe(0);
});
