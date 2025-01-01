import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { UserSettingsContext } from "./context";
import type { Callback } from "./types";

export function HeaderControllerProvider({ children }: PropsWithChildren) {
  const clickCallback = useRef<Callback>(undefined);

  return (
    <UserSettingsContext
      value={{
        clickCallback,
      }}
    >
      {children}
    </UserSettingsContext>
  );
}
