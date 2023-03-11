import type { HTMLProps } from "react";

type Props = Pick<
  HTMLProps<HTMLButtonElement>,
  "onClick" | "children" | "disabled" | "className"
>;

export function ActionButton({
  children,
  className,
  disabled,
  onClick,
}: Props) {
  return (
    <div className="relative bg-clip-content">
      {disabled && (
        <div
          className={`absolute h-full w-full bg-green-900 ${
            disabled ? "opacity-70" : "opacity-0"
          }`}
        />
      )}
      <button
        disabled={disabled}
        type="button"
        className={`cursor-pointer select-none bg-green-600 p-4 text-center text-xl font-bold shadow-md hover:bg-green-500 hover:shadow-lg ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
