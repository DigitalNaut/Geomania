import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { UserSettingsContext } from ".";
import type { Callback } from "./types";

export function HeaderControllerProvider({ children }: PropsWithChildren) {
  const onClickCallback = useRef<Callback>(undefined);

  return (
    <UserSettingsContext
      value={{
        onClickCallback,
      }}
    >
      {children}
    </UserSettingsContext>
  );
}
