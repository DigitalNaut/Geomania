import type { LatLngTuple } from "leaflet";

import type { CountryData, useCountryStore } from "src/hooks/useCountryStore";
import type { useMapControl } from "src/hooks/useMapControl";
import { useUserGuessRecord } from "src/contexts/GuessRecordContext";
import { useTally } from "src/hooks/useTally";
import { useInputField } from "src/hooks/useInputField";

export function useCountryQuiz(
  countryStore: ReturnType<typeof useCountryStore>,
  mapControl: ReturnType<typeof useMapControl>,
  setError: (error: Error) => void
) {
  const {
    storedCountry: countryCorrectAnswer,
    compareStoredCountry: checkAnswer,
    getRandomCountryData,
  } = countryStore;
  const {
    inputRef: answerInputRef,
    setInputField: setAnswerInputField,
    focusInputField: focusAnswerInputField,
  } = useInputField();
  const { pushGuessToHistory, guessHistory, lastGuess, updateCountryStats } =
    useUserGuessRecord();
  const {
    tally: userGuessTally,
    incrementTally: incrementTriesTally,
    resetTally: resetTriesTally,
  } = useTally();

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

  function focusUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryCorrectAnswer.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    mapControl.flyTo(destination);
    focusAnswerInputField();
  }

  function showNextCountry() {
    try {
      const nextCountry = getRandomCountryData();
      focusUI(nextCountry);
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
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
    if (countryCorrectAnswer.data) focusUI(countryCorrectAnswer.data);
    else showNextCountry();
  };

  const skipCountry = () => {
    resetUI();
    showNextCountry();
  };

  return {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,

    guessHistory,
    resetUI,
    showNextCountry,
    skipCountry,
    handleMapClick,
  };
}
