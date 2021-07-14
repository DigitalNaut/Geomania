import { getCountryNames } from "./DataParser";

test('extracts a list of countries from JSON', async () => {
  let countryNames = await getCountryNames().then(data => data);
  expect(countryNames.length).toBeGreaterThan(0);
});
