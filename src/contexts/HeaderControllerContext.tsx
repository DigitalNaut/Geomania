import { type MutableRefObject, type PropsWithChildren, createContext, useContext, useRef } from "react";

type Callback = (() => void) | undefined;

type HeaderControllerContext = {
  onClickCallback: MutableRefObject<Callback>;
};

const userSettingsContext = createContext<HeaderControllerContext | null>(null);

export default function HeaderControllerProvider({ children }: PropsWithChildren) {
  const onClickCallback = useRef<Callback>();

  return (
    <userSettingsContext.Provider
      value={{
        onClickCallback,
      }}
    >
      {children}
    </userSettingsContext.Provider>
  );
}

export function useHeaderControllerContext() {
  const context = useContext(userSettingsContext);
  if (!context) throw new Error("useHeaderControllerContext must be used within a HeaderControllerProvider");

  return context;
}