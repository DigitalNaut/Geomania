import { useContext, createContext } from "react";

import {} from "react";

import type { GuessRecordContextType } from "./types";

const guessRecordContext = createContext<GuessRecordContextType | null>(null);

export const Provider = guessRecordContext.Provider;

export function useUserGuessRecord() {
  const context = useContext(guessRecordContext);
  if (!context) throw new Error("useUserGuessRecord must be used within a UserGuessRecordProvider");
  return context;
}

export { UserGuessRecordProvider } from "./Provider";
