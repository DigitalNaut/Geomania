// TODO: Track & remove when fixed by TypesCript/Node
// @ts-expect-error Missing types JSON for import "{ type: "json" }"
import type countryData from "../../../src/assets/data/features/countries.json";

export type CountryFeatures = typeof countryData;
export type CountryData = CountryFeatures[number];
export type CountryMap = Map<string, CountryData>;
export type ContinentMap = Map<string, string[]>;
