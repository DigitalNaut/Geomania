import { createContext, useContext } from "react";

import type { GoogleDriveContextType } from "./types";

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

export const Provider = googleDriveContext.Provider;

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context) throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");

  return context;
}

export { GoogleDriveProvider } from "./Provider";
