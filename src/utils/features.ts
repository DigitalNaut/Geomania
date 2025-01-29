import type { LatLngTuple } from "leaflet";

import type { CountryData } from "src/store/CountryStore/types";

export function getCountryCoordinates(country: CountryData): LatLngTuple {
  const { LABEL_X, LABEL_Y } = country;
  if (LABEL_X && LABEL_Y) return [LABEL_Y, LABEL_X];
  else return [0, 0];
}

export function normalizeName(name?: string) {
  return name
    ?.trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
