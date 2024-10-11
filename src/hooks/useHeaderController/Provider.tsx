import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { Provider } from ".";
import type { Callback } from "./types";

export function HeaderControllerProvider({ children }: PropsWithChildren) {
  const onClickCallback = useRef<Callback>();

  return (
    <Provider
      value={{
        onClickCallback,
      }}
    >
      {children}
    </Provider>
  );
}
