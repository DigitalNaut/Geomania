import { type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export function InlineButton({
  children,
  onClick,
  className,
  small,
}: PropsWithChildren<{ onClick: () => void; className?: string; small?: true }>) {
  return (
    <button
      className={twMerge(
        "flex h-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100 active:bg-slate-200",
        small ? "px-2 py-0 gap-1" : "text-base",
        className,
      )}
      role="button"
      title="Reset visited"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
