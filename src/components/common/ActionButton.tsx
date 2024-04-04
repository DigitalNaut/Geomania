import type { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ActionButtonProps = Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type">;

export function ActionButton({ children, className, disabled, onClick, ...props }: ActionButtonProps) {
  return (
    <button
      disabled={disabled}
      className={twMerge(
        "group relative cursor-pointer select-none bg-green-600 p-4 text-center text-xl font-bold shadow-md hover:bg-green-500 hover:shadow-lg disabled:cursor-not-allowed",
        className,
      )}
      onClick={onClick}
      type="button"
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 size-full bg-green-900 opacity-0 group-disabled:opacity-70" />
      {children}
    </button>
  );
}
