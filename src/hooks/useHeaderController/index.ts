import { createContext, useContext, useEffect } from "react";

import type { HeaderControllerContext } from "./types";

export const userSettingsContext = createContext<HeaderControllerContext | null>(null);

export const Provider = userSettingsContext.Provider;

export function useHeaderControllerContext() {
  const context = useContext(userSettingsContext);
  if (!context) throw new Error("useHeaderControllerContext must be used within a HeaderControllerProvider");

  return context;
}

export default function useHeaderController(clickCallback: () => void) {
  const { onClickCallback } = useHeaderControllerContext();

  useEffect(() => {
    // Assign new callback
    onClickCallback.current = () => clickCallback();
    // Reset header callback on unload
    return () => (onClickCallback.current = undefined);
  }, [clickCallback, onClickCallback]);
}

export { HeaderControllerProvider } from "./Provider";
