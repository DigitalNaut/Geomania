import type { Feature } from "geojson";
import type { LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData } from "src/controllers/MapController";
import { normalizeName, joinName } from "src/utility";
import {
  getCountryGeometry,
  getNewCountryData,
} from "src/controllers/MapController";
import { useMapContext } from "src/controllers/MapContext";

export function useCountryGuess() {
  const { countryAnswerData, setCountryAnswerData } = useMapContext();
  const [countryFeature, setCountryFeature] = useState<Feature>();

  function getNextCountry(): CountryData {
    const { country } = getNewCountryData();
    const feature = getCountryGeometry(country.alpha3);

    setCountryAnswerData(country);
    if (feature) setCountryFeature(feature);

    return country;
  }

  const checkAnswer = (userInput: string) => {
    const correctAnswer = joinName(countryAnswerData?.name || "");
    const inputMatchesAnswer =
      normalizeName(userInput) === normalizeName(correctAnswer);

    return inputMatchesAnswer;
  };

  const coordinates = countryAnswerData
    ? ([countryAnswerData.latitude, countryAnswerData.longitude] as LatLngTuple)
    : null;

  return {
    countryCorrectAnswer: {
      data: countryAnswerData,
      feature: countryFeature,
      coordinates,
    },
    checkAnswer,
    getNextCountry,
  };
}
