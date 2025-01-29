import type { RefObject } from "react";
import { useMemo } from "react";

import { qualifyScore } from "src/controllers/scores";
import { useQuiz } from "src/controllers/useQuiz";
import { useInputField } from "src/hooks/common/useInputField";
import { useGuessRecord } from "src/hooks/useGuessRecord";
import { addVisitedCountry, getNextCountry } from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import type { IActivity } from "./types";

// const highlightStyle = "fill-yellow-400";

export function useQuizInput(): IActivity & {
  inputRef: RefObject<HTMLInputElement | null>;
  visitedCountries: string[];
  giveHint: () => void;
  submitInput: () => CountryData | null;
  userGuessTally: number;
} {
  const { submitAnswer, resetTally, userGuessTally } = useQuiz();
  const { quiz: quizState } = useAppSelector((state) => state.countryStore);
  const { inputRef, setInputField: setAnswerInputField, focusInputField: focusAnswerInputField } = useInputField();
  const { lastGuess } = useGuessRecord();
  const dispatch = useAppDispatch();

  const correctAnswer = quizState.currentCountry;
  const correctAnswerCountry = useMemo(() => (correctAnswer ? correctAnswer : null), [correctAnswer]);

  const giveHint = () => {
    if (!correctAnswer || !correctAnswerCountry) return;

    if (correctAnswer) {
      // TODO: Add a better way to provide hints
      //const hint = countryCorrectAnswer.data.name.substring(0, userTries);
      const hint = correctAnswerCountry.GEOUNIT;
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
    return dispatch(getNextCountry("quiz"));
  };

  const submitInput = () => {
    if (!correctAnswer) return null;

    const userGuess = inputRef.current?.value ?? "";

    if (isInvalidInput(userGuess)) return null;

    const isCorrect = submitAnswer(userGuess);

    if (!isCorrect) return null;

    // const style = qualifyScore(userGuessTally);
    console.log(qualifyScore(userGuessTally));
    dispatch(addVisitedCountry({ countryA3: correctAnswer.GU_A3, activityType: "quiz" }));

    resetInput();
    return showNextCountry();
  };

  const nextCountry = () => {
    resetTally();
    resetInput();
    return showNextCountry();
  };

  const start = () => showNextCountry();

  const finish = () => {};

  return {
    inputRef,
    submitInput,
    giveHint,
    nextCountry,
    userGuessTally,
    visitedCountries: quizState.visitedCountries,
    start,
    finish,
  };
}
