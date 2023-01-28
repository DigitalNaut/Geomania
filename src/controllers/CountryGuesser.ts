import type { Feature } from "geojson";
import type { LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData } from "src/controllers/MapController";
import { normalizeName, joinName } from "src/utility";
import {
  getCountryGeometry,
  getNextCountry,
} from "src/controllers/MapController";
import { useMapContext } from "src/controllers/MapContext";

export function useCountryGuess() {
  const { countryAnswerData, setCountryAnswerData } = useMapContext();
  const [countryFeature, setCountryFeature] = useState<Feature>();

  function nextCountry(): CountryData {
    const { country } = getNextCountry(true);
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

  return {
    countryCorrectAnswer: {
      data: countryAnswerData,
      feature: countryFeature,
      coordinates: countryAnswerData
        ? ([
            countryAnswerData.latitude,
            countryAnswerData.longitude,
          ] as LatLngTuple)
        : null,
    },
    checkAnswer,
    nextCountry,
  };
}
