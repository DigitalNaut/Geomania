import type { KeyboardEventHandler } from "react";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useState, useRef, useEffect } from "react";

import type { CountryData } from "src/controllers/MapController";
import { useMapContext } from "src/contexts/MapContext";
import { useCountryGuess } from "src/controllers/CountryGuesser";

export type UserCountryGuess = {
  timestamp: number;
  text: string;
  isCorrect: boolean;
  countryCode?: string;
};

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

function useGuessHistory() {
  const [guessHistory, setGuessHistory] = useState<UserCountryGuess[]>([]);

  function saveToLocalStorage(history: UserCountryGuess[]) {
    localStorage.setItem("guessHistory", JSON.stringify(history));
  }

  function pushGuessToHistory(newGuess: Omit<UserCountryGuess, "timestamp">) {
    const timestampedGuess: UserCountryGuess = {
      ...newGuess,
      timestamp: Date.now(),
    };

    setGuessHistory((prev) => {
      const newHistory = [timestampedGuess, ...prev];
      saveToLocalStorage(newHistory);
      return newHistory;
    });
  }

  useEffect(() => {
    const history = localStorage.getItem("guessHistory");
    if (history) setGuessHistory(JSON.parse(history));
  }, []);

  return { guessHistory, pushGuessToHistory };
}

export function useMapVisitor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { map } = useMapContext();
  const { countryCorrectAnswer, checkAnswer, getNextCountry } =
    useCountryGuess();
  const { pushGuessToHistory, guessHistory } = useGuessHistory();
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

  const prepareNextCountry = () => {
    updateUI(getNextCountry());
    resetTriesTally();
    setInputField("");
  };

  const handleSubmitAnswer = () => {
    if (!inputRef.current) {
      setError(new Error("Input field not found."));
      return;
    }

    const userGuess = inputRef.current.value;
    const isCorrect = checkAnswer(userGuess);
    const isValidNewGuess =
      userGuess.length > 0 && userGuess !== guessHistory[0]?.text;

    if (!isValidNewGuess) return;

    if (isCorrect) prepareNextCountry();
    else incrementTriesTally();

    pushGuessToHistory({
      text: userGuess,
      isCorrect,
      countryCode: countryCorrectAnswer.data?.alpha3,
    });
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
    userGuessTally,
    giveHint,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
    guessHistory,
    error,
    dismissError,
  };
}
