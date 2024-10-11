import { useEffect, useState } from "react";
import { z } from "zod";

import type { CountryGuess, CountryStat, CountryStats } from "./types";
import { CountryGuessSchema } from "./types";

export function useGuessHistory(limit: number) {
  const [guessHistory, setGuessHistory] = useState<CountryGuess[]>([]);

  useEffect(() => {
    const history = localStorage.getItem("guessHistory") ?? "";

    try {
      const validHistory = z.array(CountryGuessSchema).parse(JSON.parse(history));
      setGuessHistory(validHistory);
    } catch {
      localStorage.removeItem("guessHistory");
    }
  }, []);

  function saveToLocalStorage(history: CountryGuess[]) {
    localStorage.setItem("guessHistory", JSON.stringify(history));
  }

  const pushGuessToHistory = (newGuess: Omit<CountryGuess, "timestamp">) => {
    const timestampedGuess: CountryGuess = {
      ...newGuess,
      timestamp: Date.now(),
    };

    setGuessHistory((prev) => {
      const newHistory = [...prev, timestampedGuess];

      if (newHistory.length > limit) newHistory.shift();

      saveToLocalStorage(newHistory);
      return newHistory;
    });
  };

  const clearGuessHistory = () => {
    localStorage.removeItem("guessHistory");
    setGuessHistory([]);
  };

  return { guessHistory, pushGuessToHistory, clearGuessHistory };
}

export function useCountryStats() {
  const [countryStats, setCountryStats] = useState<CountryStats>({});

  const pushCountryStat = ({ ISO_A2_EH, GU_A3, GEOUNIT, isCorrect }: CountryStat) => {
    setCountryStats((prevStats) => {
      const country = prevStats[GU_A3];
      const newStats = {
        ...prevStats,
        [GU_A3]: {
          GEOUNIT,
          ISO_A2_EH,
          GU_A3,
          correctGuesses: (country?.correctGuesses ?? 0) + (isCorrect ? 1 : 0),
          incorrectGuesses: (country?.incorrectGuesses ?? 0) + (isCorrect ? 0 : 1),
          lastGuessTimestamp: Date.now(),
        },
      };

      localStorage.setItem("countryStats", JSON.stringify(newStats));
      return newStats;
    });
  };

  // Restore country stats from previous session
  useEffect(() => {
    const stats = localStorage.getItem("countryStats");
    if (stats) setCountryStats(JSON.parse(stats));
  }, []);

  const clearCountryStats = () => {
    localStorage.removeItem("countryStats");
    setCountryStats({});
  };

  return { countryStats, pushCountryStat, clearCountryStats };
}
