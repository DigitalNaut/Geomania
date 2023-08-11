import { type CountryData, useCountryStore } from "src/hooks/useCountryStore";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import { useTally } from "src/hooks/useTally";
import { useInputField } from "src/hooks/useInputField";

export function useCountryQuiz(showNextCountry: () => CountryData | null, setError: (error: Error) => void) {
  const { storedCountry: countryCorrectAnswer, compareStoredCountry: checkAnswer } = useCountryStore();
  const {
    inputRef: answerInputRef,
    setInputField: setAnswerInputField,
    focusInputField: focusAnswerInputField,
  } = useInputField();
  const { pushGuessToHistory, lastGuess, updateCountryStats } = useUserGuessRecordContext();
  const { tally: userGuessTally, incrementTally: incrementTriesTally, resetTally: resetTriesTally } = useTally();

  const giveHint = () => {
    if (countryCorrectAnswer.data) {
      // TODO: Add a better way to provide hints
      //const hint = countryCorrectAnswer.data.name.substring(0, userTries);
      const hint = countryCorrectAnswer.data.name;
      setAnswerInputField(hint);
    }

    focusAnswerInputField();
  };

  const resetInput = () => {
    resetTriesTally();
    setAnswerInputField("");
  };

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
      resetInput();
      const nextCountry = showNextCountry();
      if (nextCountry) focusAnswerInputField();
    } else incrementTriesTally();

    if (countryCorrectAnswer.data) {
      const { a2, a3, name } = countryCorrectAnswer.data;

      pushGuessToHistory({
        text: userGuess,
        isCorrect,
        a2,
        a3,
      });

      updateCountryStats({
        name,
        isCorrect,
        a2,
        a3,
      });
    }

    return isCorrect;
  };

  const skipCountry = () => {
    resetInput();
    const nextCountry = showNextCountry();
    if (nextCountry) focusAnswerInputField();
  };

  return {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,
    skipCountry,
  };
}
