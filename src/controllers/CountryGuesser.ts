import type { Feature } from "geojson";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData } from "src/controllers/MapController";
import {
  getCountryGeometry,
  getCountryData,
} from "src/controllers/MapController";
import { useMapContext } from "src/contexts/MapContext";
import { useUserGuessRecord } from "src/contexts/GuessRecordContext";
import { useTally } from "src/hooks/useTally";
import { useInputField } from "src/hooks/useInputField";

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function getCountryCoordinates(country: CountryData) {
  if (!country) return null;
  return [country.latitude, country.longitude] as LatLngTuple;
}

/**
 * Normalizes a name by removing diacritics and trimming whitespace.
 */
export function normalizeName(text?: string) {
  return text
    ?.trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function useCountryGuess() {
  const { countryAnswer, setCountryAnswer } = useMapContext();
  const [countryFeature, setCountryFeature] = useState<Feature>();

  function getRandomCountryData(): CountryData {
    const { country, countryIndex } = getCountryData(randomIndex);

    if (!country) throw new Error(`No country found for index ${countryIndex}`);

    const feature = getCountryGeometry(country.alpha3);

    if (feature) setCountryFeature(feature);
    else throw new Error(`No feature found for ${country.name}`);

    setCountryAnswer(country);

    return country;
  }

  const checkAnswer = (userInput: string) => {
    const correctAnswer = countryAnswer?.name || "";
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
    getRandomCountryData,
    checkAnswer,
  };
}

export function useCountryGuesser(setError: (error: Error) => void) {
  const { map } = useMapContext();
  const {
    inputRef: answerInputRef,
    setInputField: setAnswerInputField,
    focusInputField: focusAnswerInputField,
  } = useInputField();
  const { pushGuessToHistory, guessHistory, lastGuess, updateCountryStats } =
    useUserGuessRecord();
  const { countryCorrectAnswer, checkAnswer, getRandomCountryData } =
    useCountryGuess();
  const {
    tally: userGuessTally,
    incrementTally: incrementTriesTally,
    resetTally: resetTriesTally,
  } = useTally();

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, 5, {
      animate: true,
      duration: 0.1,
    });
  }

  function giveHint() {
    if (countryCorrectAnswer.data) {
      // TODO: Add a better way to provide hints
      //const hint = countryCorrectAnswer.data.name.substring(0, userTries);
      const hint = countryCorrectAnswer.data.name;
      setAnswerInputField(hint);
    }

    focusAnswerInputField();
  }

  const resetUI = () => {
    resetTriesTally();
    setAnswerInputField("");
  };

  function updateUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryCorrectAnswer.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    flyTo(destination);
    focusAnswerInputField();
  }

  function showNextCountry(tries = 0) {
    const retries = tries;
    try {
      const nextCountry = getRandomCountryData();
      updateUI(nextCountry);
    } catch (error) {
      if (tries < 5) {
        if (error instanceof Error) setError(error);
        console.log("No country data found. Retrying...", retries);
        showNextCountry(retries + 1);
      } else setError(new Error("No country data found."));
    }
  }

  const submitAnswer = () => {
    if (!answerInputRef.current) {
      setError(new Error("Input field not found."));
      return false;
    }

    const userGuess = answerInputRef.current.value;
    const isCorrect = checkAnswer(userGuess);
    const isValidNewGuess =
      userGuess.length > 0 && userGuess !== lastGuess?.text;

    if (!isValidNewGuess) return false;

    if (isCorrect) {
      resetUI();
      showNextCountry();
    } else incrementTriesTally();

    pushGuessToHistory({
      text: userGuess,
      isCorrect,
      countryCode: countryCorrectAnswer.data?.alpha3,
    });

    if (countryCorrectAnswer.data?.alpha3) {
      updateCountryStats(
        countryCorrectAnswer.data?.alpha3 || "",
        countryCorrectAnswer.data?.name || "",
        isCorrect
      );
    }

    return isCorrect;
  };

  const handleMapClick = () => {
    if (countryCorrectAnswer.data) updateUI(countryCorrectAnswer.data);
    else showNextCountry();
  };

  const skipCountry = () => {
    resetUI();
    showNextCountry();
  };

  return {
    answerInputRef,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
    submitAnswer,
    userGuessTally,
    giveHint,

    guessHistory,
    countryCorrectAnswer,
    resetUI,
    showNextCountry,
    skipCountry,
    handleMapClick,
  };
}
