import { createContext, useContext, useEffect } from "react";

import type { HeaderControllerContextType } from "./types";

export const UserSettingsContext = createContext<HeaderControllerContextType | null>(null);

export function useHeaderControllerContext() {
  const context = useContext(UserSettingsContext);
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
