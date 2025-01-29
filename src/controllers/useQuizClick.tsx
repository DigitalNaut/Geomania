import allFeaturesData from "src/assets/data/features/countries.json";
import { qualifyScore } from "src/controllers/scores";
import { useQuiz } from "src/controllers/useQuiz";
import { addVisitedCountry, getNextCountry } from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import type { IActivity } from "./types";

export function useQuizClick(): IActivity & {
  giveHint: () => void;
  submitClick: (a3: string) => CountryData | null;
  userGuessTally: number;
} {
  const { submitAnswer, userGuessTally, resetTally } = useQuiz();
  const {
    quiz: { currentCountry },
  } = useAppSelector((state) => state.countryStore);
  const dispatch = useAppDispatch();

  const giveHint = () => {
    if (currentCountry) {
      // TODO: Add a better way to provide hints
    }
  };

  const submitClick = (a3: string) => {
    const unitName = allFeaturesData.find((data) => data.GU_A3 === a3)?.GEOUNIT;
    if (!unitName) return null;

    const isCorrect = submitAnswer(unitName);

    if (!isCorrect) return null;

    // const style = qualifyScore(userGuessTally);
    console.log(qualifyScore(userGuessTally));

    dispatch(addVisitedCountry({ countryA3: a3, activityType: "quiz" }));
    return dispatch(getNextCountry("quiz"));
  };

  const nextCountry = () => {
    resetTally();
    return dispatch(getNextCountry("quiz"));
  };

  const start = () => nextCountry();

  const finish = () => {};

  return { giveHint, submitClick, userGuessTally, nextCountry, start, finish };
}
