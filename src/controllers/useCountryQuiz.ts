import { useMapViewport } from "src/hooks/useMapViewport";
import { type CountryData, type useCountryStore, getCountryCoordinates } from "src/hooks/useCountryStore";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import { useTally } from "src/hooks/useTally";
import { useInputField } from "src/hooks/useInputField";

export function useCountryQuiz(countryStore: ReturnType<typeof useCountryStore>, setError: (error: Error) => void) {
  const mapControl = useMapViewport();
  const { storedCountry: countryCorrectAnswer, compareStoredCountry: checkAnswer, getRandomCountryData } = countryStore;
  const {
    inputRef: answerInputRef,
    setInputField: setAnswerInputField,
    focusInputField: focusAnswerInputField,
  } = useInputField();
  const { pushGuessToHistory, guessHistory, lastGuess, updateCountryStats } = useUserGuessRecordContext();
  const { tally: userGuessTally, incrementTally: incrementTriesTally, resetTally: resetTriesTally } = useTally();

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
    const destination = getCountryCoordinates(nextCountry);
    mapControl.flyTo(destination);
    focusAnswerInputField();
  }

  function showNextCountry() {
    try {
      const nextCountry = getRandomCountryData();
      if (nextCountry) focusUI(nextCountry);
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
    const isValidNewGuess = userGuess.length > 0 && userGuess !== lastGuess?.text;

    if (!isValidNewGuess) return false;

    if (isCorrect) {
      resetUI();
      showNextCountry();
    } else incrementTriesTally();

    if (countryCorrectAnswer.data) {
      const { alpha2, alpha3, name } = countryCorrectAnswer.data;

      pushGuessToHistory({
        text: userGuess,
        isCorrect,
        alpha2,
        alpha3,
      });

      updateCountryStats({
        name,
        isCorrect,
        alpha2,
        alpha3,
      });
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
