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

async function loadData(): Promise<GeoJSON> {
  //@ts-ignore
  let data: GeoJSON = (full) ?
    await import("data/countries.json") : await import("data/mock.json");

  return new Promise((resolve, reject) => {
    if (data)
      resolve(data);
    else
      reject(null);
  });
}
