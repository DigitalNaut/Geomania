import { qualifyScore } from "src/controllers/scores";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useQuiz } from "src/controllers/useQuiz";
import allFeaturesData from "src/assets/data/features/countries.json";

export function useQuizClick() {
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

  return { visitedCountries, giveHint, submitClick, userGuessTally, nextCountry };
}
