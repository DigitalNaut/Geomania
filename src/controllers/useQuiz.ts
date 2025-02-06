import { useTally } from "src/hooks/common/useTally";
import { useGuessRecord } from "src/hooks/useGuessRecord";
import { normalizeName } from "src/utils/features";

import { useCallback } from "react";
import CorrectSound from "src/assets/sounds/correct.mp3?url";
import IncorrectSound from "src/assets/sounds/incorrect.mp3?url";
import { useAppSelector } from "src/store/hooks";

const incorrectAnswerAudioSrc = new URL(IncorrectSound, import.meta.url);
const correctAnswerAudioSrc = new URL(CorrectSound, import.meta.url);
const incorrectAnswerTrack = new Audio(incorrectAnswerAudioSrc.href);
const correctAnswerTrack = new Audio(correctAnswerAudioSrc.href);

function playAudio(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play();
}

export function useQuiz() {
  const { quiz } = useAppSelector((state) => state.countryStore);

  const { createRecord } = useGuessRecord();
  const { tally, upTally, resetTally } = useTally();
  const correctAnswer = quiz.currentCountry;

  const checkAnswer = useCallback(
    (guess: string) => {
      if (!correctAnswer) return false;

      const answer = correctAnswer.GEOUNIT;
      const inputMatchesAnswer = normalizeName(guess) === normalizeName(answer);

      return inputMatchesAnswer;
    },
    [correctAnswer],
  );

  const submitAnswer = (userGuess: string) => {
    if (!userGuess || userGuess.length === 0 || !correctAnswer) return false;

    const isCorrect = checkAnswer(userGuess);

    if (isCorrect) {
      resetTally();
    } else {
      upTally();
    }

    playAudio(isCorrect ? correctAnswerTrack : incorrectAnswerTrack);

    const { ISO_A2_EH, GU_A3, GEOUNIT } = correctAnswer;

    createRecord({
      text: userGuess,
      isCorrect,
      GEOUNIT,
      ISO_A2_EH,
      GU_A3,
    });

    return isCorrect;
  };

  return { submitAnswer, userGuessTally: tally, resetTally };
}
