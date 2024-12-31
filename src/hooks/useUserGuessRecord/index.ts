import { useContext, createContext } from "react";

import {} from "react";

import type { GuessRecordContextType } from "./types";

export const GuessRecordContext = createContext<GuessRecordContextType | null>(null);

export function useUserGuessRecord() {
  const context = useContext(GuessRecordContext);
  if (!context) throw new Error("useUserGuessRecord must be used within a UserGuessRecordProvider");
  return context;
}

export { UserGuessRecordProvider } from "./Provider";
