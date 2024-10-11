import type { CountryData } from "src/hooks/useCountryStore/types";
import { z } from "zod";

export const CountryGuessSchema = z.object({
  timestamp: z.number(),
  text: z.string(),
  isCorrect: z.boolean(),
  GU_A3: z.string(),
  ISO_A2_EH: z.string(),
});

export type CountryGuess = z.infer<typeof CountryGuessSchema>;

export type CountryStat = Omit<CountryGuess, "timestamp" | "text"> & Pick<CountryData, "GEOUNIT">;

export type GuessStats = {
  correctGuesses: number;
  incorrectGuesses: number;
  lastGuessTimestamp: number;
} & Pick<CountryData, "GU_A3" | "ISO_A2_EH" | "GEOUNIT">;

export type CountryStats = Record<string, GuessStats>;

export type GuessRecordContextType = {
  guessHistory: CountryGuess[];
  lastGuess?: CountryGuess;
  createRecord(record: Omit<CountryGuess, "timestamp"> & Pick<CountryData, "GEOUNIT">): void;
  countryStats: CountryStats;
  clearProgress(): void;
};
