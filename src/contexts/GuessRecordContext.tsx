import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type UserCountryGuess = {
  timestamp: number;
  text: string;
  isCorrect: boolean;
  countryCode?: string;
};

export type UserCountryStats = {
  [countryCode: string]: {
    countryName: string;
    correctGuesses: number;
    incorrectGuesses: number;
    lastTimestamp: number;
  };
};

type GuessRecordContextType = {
  guessHistory: UserCountryGuess[];
  lastGuess?: UserCountryGuess;
  pushGuessToHistory(newGuess: Omit<UserCountryGuess, "timestamp">): void;
  countryStats: UserCountryStats;
  updateCountryStats(
    countryCode: string,
    countryName: string,
    isCorrect: boolean
  ): void;
  clearProgress(): void;
};

const guessRecordContext = createContext<GuessRecordContextType>({
  guessHistory: [],
  pushGuessToHistory: () => null,
  countryStats: {},
  updateCountryStats: () => null,
  clearProgress: () => null,
});

function useGuessHistory(limit: number) {
  const [guessHistory, setGuessHistory] = useState<UserCountryGuess[]>([]);

  function saveToLocalStorage(history: UserCountryGuess[]) {
    localStorage.setItem("guessHistory", JSON.stringify(history));
  }

  const pushGuessToHistory: GuessRecordContextType["pushGuessToHistory"] = (
    newGuess
  ) => {
    const timestampedGuess: UserCountryGuess = {
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

  useEffect(() => {
    const history = localStorage.getItem("guessHistory");
    if (history) setGuessHistory(JSON.parse(history));
  }, []);

  const clearGuessHistory = () => {
    localStorage.removeItem("guessHistory");
    setGuessHistory([]);
  };

  return { guessHistory, pushGuessToHistory, clearGuessHistory };
}

function useCountryStats() {
  const [countryStats, setCountryStats] = useState<UserCountryStats>({});

  const updateCountryStats: GuessRecordContextType["updateCountryStats"] = (
    countryCode,
    countryName,
    isCorrect
  ) => {
    setCountryStats((prevStats) => {
      const country = prevStats[countryCode];
      const newStats = {
        ...prevStats,
        [countryCode]: {
          countryName,
          correctGuesses: (country?.correctGuesses || 0) + (isCorrect ? 1 : 0),
          incorrectGuesses:
            (country?.incorrectGuesses || 0) + (isCorrect ? 0 : 1),
          lastTimestamp: Date.now(),
        },
      };

      localStorage.setItem("countryStats", JSON.stringify(newStats));
      return newStats;
    });
  };

  useEffect(() => {
    const stats = localStorage.getItem("countryStats");
    if (stats) setCountryStats(JSON.parse(stats));
  }, []);

  const clearCountryStats = () => {
    localStorage.removeItem("countryStats");
    setCountryStats({});
  };

  return { countryStats, updateCountryStats, clearCountryStats };
}

export default function UserGuessRecordProvider({
  children,
  historyLimit,
}: PropsWithChildren<{
  historyLimit: number;
}>) {
  const { guessHistory, pushGuessToHistory, clearGuessHistory } =
    useGuessHistory(historyLimit);
  const { countryStats, updateCountryStats, clearCountryStats } =
    useCountryStats();

  const clearProgress = () => {
    clearGuessHistory();
    clearCountryStats();
  };

  return (
    <guessRecordContext.Provider
      value={{
        guessHistory,
        pushGuessToHistory,
        lastGuess: guessHistory[guessHistory.length - 1],
        countryStats,
        updateCountryStats,
        clearProgress,
      }}
    >
      {children}
    </guessRecordContext.Provider>
  );
}

export function useUserGuessRecord() {
  const context = useContext(guessRecordContext);
  if (!context)
    throw new Error(
      "useUserGuessRecord must be used within a UserGuessRecordProvider"
    );
  return context;
}
