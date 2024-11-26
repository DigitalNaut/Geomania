import type { NullableCountryData } from "src/types/features";

export type IActivity = {
  nextCountry: () => NullableCountryData;
  start: () => void;
  finish: () => void;
};
