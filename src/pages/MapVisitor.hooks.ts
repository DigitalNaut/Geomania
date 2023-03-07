import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useState, useRef } from "react";

import type { CountryData } from "src/controllers/MapController";
import { useMapContext } from "src/contexts/MapContext";
import { useCountryGuess } from "src/controllers/CountryGuesser";
import { useUserGuessRecord } from "src/contexts/GuessRecordContext";

function useTally() {
  const [tally, setTally] = useState(0);

  function incrementTally() {
    setTally((prev) => prev + 1);
  }

  function resetTally() {
    setTally(0);
  }

  return { tally, incrementTally, resetTally };
}

export function useMapVisitor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { map } = useMapContext();
  const { pushGuessToHistory, guessHistory, updateCountryStats } =
    useUserGuessRecord();
  const { countryCorrectAnswer, checkAnswer, getRandomCountryData } =
    useCountryGuess();
  const {
    tally: userGuessTally,
    incrementTally: incrementTriesTally,
    resetTally: resetTriesTally,
  } = useTally();
  const [error, setError] = useState<Error | null>(null);

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, 5, {
      animate: true,
      duration: 0.1,
    });
  }

  function giveHint() {
    if (countryCorrectAnswer.data) {
      // TODO: Revert
      //const hint = countryCorrectAnswer.data.name.substring(0, userTries);
      const hint = countryCorrectAnswer.data.name;
      setInputField(hint);
    }

    focusInputField();
  }

  function focusInputField() {
    inputRef.current?.focus();
  }

  function setInputField(newValue: string) {
    if (inputRef.current) inputRef.current.value = newValue;
  }

  function updateUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryCorrectAnswer.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    flyTo(destination);
    focusInputField();
  }

  function showNextCountry(tries = 0) {
    const retries = tries || 0;
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

  const prepareNextCountry = () => {
    resetTriesTally();
    setInputField("");
    showNextCountry();
  };

  const submitAnswer = () => {
    if (!inputRef.current) {
      setError(new Error("Input field not found."));
      return false;
    }

    const userGuess = inputRef.current.value;
    const isCorrect = checkAnswer(userGuess);
    const isValidNewGuess =
      userGuess.length > 0 && userGuess !== guessHistory[0]?.text;

    if (!isValidNewGuess) return false;

    if (isCorrect) prepareNextCountry();
    else incrementTriesTally();

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
  const handleSkipCountry = prepareNextCountry;
  const dismissError = () => setError(null);

  return {
    inputRef,
    submitAnswer,
    handleMapClick,
    handleSkipCountry,
    countryCorrectAnswer,
    userGuessTally,
    giveHint,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
    guessHistory,
    error,
    dismissError,
  };
}
