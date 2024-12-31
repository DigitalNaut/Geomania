import type { RefObject } from "react";

export type Callback = (() => void) | undefined;

export type HeaderControllerContextType = {
  onClickCallback: RefObject<Callback>;
};
