import { type PropsWithChildren, createContext, useContext, useEffect, useState, useMemo } from "react";

import type { CountryData } from "src/hooks/useCountryStore";
import { z } from "zod";

const CountryGuessSchema = z.object({
  timestamp: z.number(),
  text: z.string(),
  isCorrect: z.boolean(),
  GU_A3: z.string(),
  ISO_A2_EH: z.string(),
});

export type CountryGuess = z.infer<typeof CountryGuessSchema>;

type CountryStat = Omit<CountryGuess, "timestamp" | "text"> & Pick<CountryData, "GEOUNIT">;

export type GuessStats = {
  correctGuesses: number;
  incorrectGuesses: number;
  lastGuessTimestamp: number;
} & Pick<CountryData, "GU_A3" | "ISO_A2_EH" | "GEOUNIT">;

type CountryStats = Record<string, GuessStats>;

type GuessRecordContextType = {
  guessHistory: CountryGuess[];
  lastGuess?: CountryGuess;
  createRecord(record: Omit<CountryGuess, "timestamp"> & Pick<CountryData, "GEOUNIT">): void;
  countryStats: CountryStats;
  clearProgress(): void;
};

const guessRecordContext = createContext<GuessRecordContextType | null>(null);

function useGuessHistory(limit: number) {
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

function useCountryStats() {
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

export default function UserGuessRecordProvider({
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
    <guessRecordContext.Provider
      value={{
        createRecord,
        guessHistory,
        lastGuess,
        countryStats,
        clearProgress,
      }}
    >
      {children}
    </guessRecordContext.Provider>
  );
}

export function useUserGuessRecordContext() {
  const context = useContext(guessRecordContext);
  if (!context) throw new Error("useUserGuessRecord must be used within a UserGuessRecordProvider");
  return context;
}
