import { useCountryStore } from "src/hooks/useCountryStore";
import { useUserGuessRecord } from "src/hooks/useUserGuessRecord";
import { useTally } from "src/hooks/useTally";

import IncorrectSound from "src/assets/sounds/incorrect.mp3?url";
import CorrectSound from "src/assets/sounds/correct.mp3?url";
import { useVisitedCountries } from "src/hooks/useVisitedCountries";

const incorrectAnswerAudioSrc = new URL(IncorrectSound, import.meta.url);
const correctAnswerAudioSrc = new URL(CorrectSound, import.meta.url);
const incorrectAnswerTrack = new Audio(incorrectAnswerAudioSrc.href);
const correctAnswerTrack = new Audio(correctAnswerAudioSrc.href);

function playAudio(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play();
}

export function useQuiz() {
  const { visitedCountries, pushVisitedCountry } = useVisitedCountries();

  const { storedCountry: correctAnswer, compareStoredCountry: checkAnswer } = useCountryStore();

  const { createRecord } = useUserGuessRecord();
  const { tally, upTally, resetTally } = useTally();

  const submitAnswer = (userGuess: string) => {
    if (!userGuess || userGuess.length === 0 || !correctAnswer.data) return false;

    const isCorrect = checkAnswer(userGuess);

    if (isCorrect) {
      resetTally();
      playAudio(correctAnswerTrack);
    } else {
      upTally();
      playAudio(incorrectAnswerTrack);
    }

    const { ISO_A2_EH, GU_A3, GEOUNIT } = correctAnswer.data;

    createRecord({
      text: userGuess,
      isCorrect,
      GEOUNIT,
      ISO_A2_EH,
      GU_A3,
    });

    return isCorrect;
  };

  return {
    submitAnswer,
    userGuessTally: tally,
    resetTally,
    visitedCountries,
    pushVisitedCountry,
  };
}
