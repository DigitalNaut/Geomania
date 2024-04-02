import { useCountryStore } from "src/hooks/useCountryStore";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import { useInputField } from "src/hooks/useInputField";
import { useQuiz } from "src/controllers/useQuiz";
import { useMemo } from "react";

const styles = {
  perfectStyle: "fill-green-600 stroke-green-400",
  correctStyle: "fill-green-700 stroke-green-400",
  incorrectStyle: "fill-green-800 stroke-green-400",
};

const highlightStyle = "fill-yellow-400";

export function useQuizInput() {
  const { submitAnswer, resetTally, userGuessTally, pushVisitedCountry, visitedCountries } = useQuiz();
  const { storedCountry: correctAnswer, setCountryDataRandom } = useCountryStore();
  const { inputRef, setInputField: setAnswerInputField, focusInputField: focusAnswerInputField } = useInputField();
  const { lastGuess } = useUserGuessRecordContext();

  const giveHint = () => {
    if (correctAnswer.data) {
      // TODO: Add a better way to provide hints
      //const hint = countryCorrectAnswer.data.name.substring(0, userTries);
      const hint = correctAnswer.data.GEOUNIT;
      setAnswerInputField(hint);
    }

    focusAnswerInputField();
  };

  const resetInput = () => {
    setAnswerInputField("");
  };

  const isInvalidInput = (input: string) => input.length === 0 || input === lastGuess?.text;

  const showNextCountry = () => {
    focusAnswerInputField();

    const nextCountry = setCountryDataRandom();
    return nextCountry;
  };

  const submitInput = () => {
    if (!correctAnswer.data) return null;

    const userGuess = inputRef.current?.value ?? "";

    if (isInvalidInput(userGuess)) return null;

    const isCorrect = submitAnswer(userGuess);

    if (!isCorrect) return null;

    const style =
      styles[userGuessTally === 0 ? "perfectStyle" : userGuessTally <= 2 ? "correctStyle" : "incorrectStyle"];
    pushVisitedCountry(correctAnswer.data.GU_A3, style);

    resetInput();
    return showNextCountry();
  };

  const nextCountry = () => {
    resetTally();
    resetInput();
    return showNextCountry();
  };

  const visitedCountriesHighlight = useMemo(() => {
    if (!correctAnswer.data) return visitedCountries;
    return [...visitedCountries, { a3: correctAnswer.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [correctAnswer.data, visitedCountries]);

  return {
    inputRef,
    submitInput,
    giveHint,
    nextCountry,
    userGuessTally,
    visitedCountries: visitedCountriesHighlight,
  };
}
