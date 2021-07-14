import { Feature, GeoJSON } from "types/map";

export function getCountryNames(): Promise<string[]> {

  function gotData(geoData: GeoJSON): string[] {
    return geoData.features.map(
      (country: Feature) => country.properties.ADMIN
    )
  }

  return new Promise((resolve) => loadData()
    .then(data => resolve(gotData(data)))
    .catch(() => resolve([""])));
}

export async function loadData(mock: Boolean = false): Promise<GeoJSON> {
  //@ts-ignore
  let data: GeoJSON = mock === true ?
    await import("data/mock.json") : await import("data/countries.json");

  return new Promise((resolve, reject) => {
    if (data) resolve(data);
    else reject(null);
  });
}
