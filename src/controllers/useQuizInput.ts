import type { RefObject } from "react";
import { useMemo } from "react";

import type { VisitedCountry } from "src/components/map/MapSvg";
import { qualifyScore } from "src/controllers/scores";
import { useQuiz } from "src/controllers/useQuiz";
import { useCountryStore } from "src/context/CountryStore";
import { useInputField } from "src/hooks/common/useInputField";
import { useUserGuessRecord } from "src/hooks/useUserGuessRecord";
import type { NullableCountryData } from "src/types/features";
import type { IActivity } from "./types";

const highlightStyle = "fill-yellow-400";

export function useQuizInput(): IActivity & {
  inputRef: RefObject<HTMLInputElement | null>;
  visitedCountries: VisitedCountry[];
  giveHint: () => void;
  submitInput: () => NullableCountryData;
  userGuessTally: number;
} {
  const { submitAnswer, resetTally, userGuessTally, pushVisitedCountry, visitedCountries } = useQuiz();
  const { storedCountry: correctAnswer, setCountryDataRandom } = useCountryStore();
  const { inputRef, setInputField: setAnswerInputField, focusInputField: focusAnswerInputField } = useInputField();
  const { lastGuess } = useUserGuessRecord();

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

    const style = qualifyScore(userGuessTally);
    pushVisitedCountry(correctAnswer.data.GU_A3, style);

    resetInput();
    return showNextCountry();
  };

  const nextCountry = () => {
    resetTally();
    resetInput();
    return showNextCountry();
  };

  const visitedCountriesWithHighlight = useMemo(() => {
    if (!correctAnswer.data) return visitedCountries;
    return [...visitedCountries, { a3: correctAnswer.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [correctAnswer.data, visitedCountries]);

  const start = () => void showNextCountry();

  const finish = () => {};

  return {
    inputRef,
    submitInput,
    giveHint,
    nextCountry,
    userGuessTally,
    visitedCountries: visitedCountriesWithHighlight,
    start,
    finish,
  };
}
