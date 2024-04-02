import { useQuiz } from "src/controllers/useQuiz";
import { useCountryStore } from "src/hooks/useCountryStore";
import allFeaturesData from "src/assets/data/features-data.json";

const styles = {
  perfectStyle: "fill-green-600 stroke-green-400",
  correctStyle: "fill-green-700 stroke-green-400",
  incorrectStyle: "fill-green-800 stroke-green-400",
};

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

    const style =
      styles[userGuessTally === 0 ? "perfectStyle" : userGuessTally <= 2 ? "correctStyle" : "incorrectStyle"];

    pushVisitedCountry(a3, style);
    return setCountryDataRandom();
  };

  const nextCountry = () => {
    resetTally();
    return setCountryDataRandom();
  };

  return { visitedCountries, giveHint, submitClick, userGuessTally, nextCountry };
}
