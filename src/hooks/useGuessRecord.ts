import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { CountryData } from "src/types/features";
import type { CountryGuess } from "src/store/UserGuessHistory/types";
import type { RootState } from "src/store";
import { clearGuessHistory, pushGuessToHistory } from "src/store/UserGuessHistory/slice";
import { clearCountryStats, pushCountryStat } from "src/store/UserGuessStats/slice";

/**
 * Manages that guess history and stats with a single interface
 */

export function useGuessRecord() {
  const dispatch = useDispatch();
  const guessHistory = useSelector((state: RootState) => state.guessHistory);
  const countryStats = useSelector((state: RootState) => state.guessStats);

  const lastGuess = useMemo(() => guessHistory[guessHistory.length - 1], [guessHistory]);

  const clearProgress = () => {
    dispatch(clearGuessHistory());
    dispatch(clearCountryStats());
  };

  const createRecord = ({
    text,
    GEOUNIT,
    isCorrect,
    GU_A3,
    ISO_A2_EH,
  }: Omit<CountryGuess, "timestamp"> & Pick<CountryData, "GEOUNIT">) => {
    dispatch(pushGuessToHistory({ text, isCorrect, ISO_A2_EH, GU_A3 }));

    dispatch(pushCountryStat({ GEOUNIT, isCorrect, ISO_A2_EH, GU_A3 }));
  };

  return {
    createRecord,
    guessHistory,
    lastGuess,
    countryStats,
    clearProgress,
  };
}
