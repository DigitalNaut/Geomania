import type { PropsWithChildren } from "react";

type MainViewProps = PropsWithChildren<{
  className?: string;
}>;

export default function MainView({ children, className }: MainViewProps) {
  return (
    <main
      className={`flex flex-1 flex-col overflow-y-auto px-2 pt-2 sm:flex-row ${className}`}
    >
      {children}
    </main>
  );
}
