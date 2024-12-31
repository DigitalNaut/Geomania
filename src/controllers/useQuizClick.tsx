import allFeaturesData from "src/assets/data/features/countries.json";
import type { VisitedCountry } from "src/components/map/MapSvg";
import { qualifyScore } from "src/controllers/scores";
import { useQuiz } from "src/controllers/useQuiz";
import { useCountryStore } from "src/context/CountryStore";
import type { NullableCountryData } from "src/types/features";
import type { IActivity } from "./types";

export function useQuizClick(): IActivity & {
  visitedCountries: VisitedCountry[];
  giveHint: () => void;
  submitClick: (a3: string) => NullableCountryData;
  userGuessTally: number;
} {
  const { submitAnswer, userGuessTally, resetTally, pushVisitedCountry, visitedCountries } = useQuiz();
  const { storedCountry: correctAnswer, setCountryDataRandom } = useCountryStore();

  const giveHint = () => {
    if (correctAnswer.data) {
      // TODO: Add a better way to provide hints
    }
  };

  const submitClick = (a3: string) => {
    const unitName = allFeaturesData.find((data) => data.GU_A3 === a3)?.GEOUNIT;
    if (!unitName) return null;

    const isCorrect = submitAnswer(unitName);

    if (!isCorrect) return null;

    const style = qualifyScore(userGuessTally);

    pushVisitedCountry(a3, style);
    return setCountryDataRandom();
  };

  const nextCountry = () => {
    resetTally();
    return setCountryDataRandom();
  };

  const start = () => void nextCountry();

  const finish = () => {};

  return { visitedCountries, giveHint, submitClick, userGuessTally, nextCountry, start, finish };
}
