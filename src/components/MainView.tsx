import type { PropsWithChildren } from "react";

export default function MainView({ children }: PropsWithChildren) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto px-2 pt-2 sm:flex-row">
      {children}
    </main>
  );
}
