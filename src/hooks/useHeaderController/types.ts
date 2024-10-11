import type { MutableRefObject } from "react";

export type Callback = (() => void) | undefined;

export type HeaderControllerContext = {
  onClickCallback: MutableRefObject<Callback>;
};
