import { createContext, useContext } from "react";

import type { UserSettingsContext } from "./types";

const userSettingsContext = createContext<UserSettingsContext | null>(null);

export const Provider = userSettingsContext.Provider;

export function useUserSettingsContext() {
  const context = useContext(userSettingsContext);
  if (!context) throw new Error("useUserSettingsContext must be used within a UserSettingsProvider");

  return context;
}

export { UserSettingsProvider } from "./Provider";
