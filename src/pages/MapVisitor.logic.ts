import type { KeyboardEventHandler } from "react";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useState, useRef } from "react";

import type { CountryData } from "src/controllers/MapController";
import { useMapContext } from "src/controllers/MapContext";
import { useCountryGuess } from "src/controllers/CountryGuesser";

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
  const { countryCorrectAnswer, checkAnswer, getNextCountry } =
    useCountryGuess();
  const {
    tally: userTries,
    incrementTally: increaseTriesTally,
    resetTally: resetTriesTally,
  } = useTally();
  const [prevGuess, setPrevGuess] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, 5, {
      animate: true,
      duration: 0.1,
    });
  }

  function giveHint() {
    if (inputRef.current && countryCorrectAnswer.data)
      inputRef.current.value = countryCorrectAnswer.data.name.substring(
        0,
        userTries
      );
  }

  function focusInputField() {
    if (inputRef.current) inputRef.current.focus();
  }

  function updateUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryCorrectAnswer.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    flyTo(destination);
    focusInputField();
  }

  function clearInputField() {
    if (inputRef.current) inputRef.current.value = "";
  }

  const prepareNextCountry = () => {
    updateUI(getNextCountry());
    resetTriesTally();
    clearInputField();
    setPrevGuess(null);
  };

  const handleSubmitAnswer = () => {
    if (!inputRef.current) {
      setError(new Error("Input field not found."));
      return;
    }

    const userGuess = inputRef.current.value;
    const isCorrect = checkAnswer(userGuess);

    if (isCorrect) prepareNextCountry();
    else {
      const isValidNewGuess = userGuess.length > 0 && userGuess !== prevGuess;
      if (isValidNewGuess) {
        setPrevGuess(userGuess);
        increaseTriesTally();
      }
    }
  };
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") handleSubmitAnswer();
  };

  const handleMapClick = () => {
    if (countryCorrectAnswer.data) updateUI(countryCorrectAnswer.data);
    else updateUI(getNextCountry());
  };

  const handleSkipCountry = prepareNextCountry;

  const dismissError = () => setError(null);

  return {
    inputRef,
    handleSubmitAnswer,
    handleMapClick,
    handleKeyDown,
    handleSkipCountry,
    countryCorrectAnswer,
    userTries,
    giveHint,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
    prevGuess,
    error,
    dismissError,
  };
}
