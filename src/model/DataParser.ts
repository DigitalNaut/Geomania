import { Feature } from "types/map";

export function getCountryNames(data: Feature[]): string[] {
  return data.map(
    (country: Feature) => country.properties.ADMIN
  )
}