import type { PropsWithChildren } from "react";
import { useMemo } from "react";

import type { CountryData } from "src/types/features";
import { Provider } from ".";
import { useCountryStats, useGuessHistory } from "./hooks";
import type { CountryGuess } from "./types";

export function UserGuessRecordProvider({
  children,
  historyLimit,
}: PropsWithChildren<{
  historyLimit: number;
}>) {
  const { guessHistory, pushGuessToHistory, clearGuessHistory } = useGuessHistory(historyLimit);
  const { countryStats, pushCountryStat, clearCountryStats } = useCountryStats();

  const lastGuess = useMemo(() => guessHistory[guessHistory.length - 1], [guessHistory]);

  const clearProgress = () => {
    clearGuessHistory();
    clearCountryStats();
  };

  const createRecord = ({
    text,
    GEOUNIT,
    isCorrect,
    GU_A3,
    ISO_A2_EH,
  }: Omit<CountryGuess, "timestamp"> & Pick<CountryData, "GEOUNIT">) => {
    pushGuessToHistory({
      text,
      isCorrect,
      ISO_A2_EH,
      GU_A3,
    });

    pushCountryStat({
      GEOUNIT,
      isCorrect,
      ISO_A2_EH,
      GU_A3,
    });
  };

  return (
    <Provider
      value={{
        createRecord,
        guessHistory,
        lastGuess,
        countryStats,
        clearProgress,
      }}
    >
      {children}
    </Provider>
  );
}
