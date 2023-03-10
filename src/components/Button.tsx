import type { PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<{
  onClick: () => void;
}>;

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      className="rounded-full bg-blue-500 py-1 px-4"
      role="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
