import { type PropsWithChildren } from "react";

export function InlineButton({ children, onClick }: PropsWithChildren<{ onClick: () => void }>) {
  return (
    <button
      className="flex h-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      role="button"
      title="Reset visited"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
