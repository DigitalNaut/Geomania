import { useEffect } from "react";

import { useHeaderControllerContext } from "./context";
import type { Callback } from "./types";

export function useHeaderController(callback?: Callback) {
  const { clickCallback } = useHeaderControllerContext();

  useEffect(() => {
    if (!callback) return undefined;

    clickCallback.current = callback;
    return () => (clickCallback.current = undefined);
  }, [callback, clickCallback]);

  return { clickCallback };
}
