import type { Feature } from "geojson";
import type { LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData } from "src/controllers/MapController";
import { normalizeName, joinName } from "src/utility";
import {
  getCountryGeometry,
  getCountryData,
} from "src/controllers/MapController";
import { useMapContext } from "src/controllers/MapContext";

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function getCountryCoordinates(country: CountryData) {
  if (!country) return null;
  return [country.latitude, country.longitude] as LatLngTuple;
}

export function useCountryGuess() {
  const { countryAnswer, setCountryAnswer } = useMapContext();
  const [countryFeature, setCountryFeature] = useState<Feature>();

  function getNextCountry(): CountryData {
    const { country, countryIndex } = getCountryData(randomIndex);
    if (!country) throw new Error(`No country found for index ${countryIndex}`);

    const feature = getCountryGeometry(country.alpha3);

    setCountryAnswer(country);
    if (feature) setCountryFeature(feature);
    else throw new Error(`No feature found for ${country.name}`);

    return country;
  }

  const checkAnswer = (userInput: string) => {
    const correctAnswer = joinName(countryAnswer?.name || "");
    const inputMatchesAnswer =
      normalizeName(userInput) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  return {
    countryCorrectAnswer: {
      data: countryAnswer,
      feature: countryFeature,
      coordinates: getCountryCoordinates(countryAnswer),
    },
    getNextCountry,
    checkAnswer,
  };
}
