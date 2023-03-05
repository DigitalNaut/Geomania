import type { HTMLProps } from "react";

type Props = Pick<
  HTMLProps<HTMLButtonElement>,
  "onClick" | "children" | "disabled"
> & {
  fit?: true;
};

export function ActionButton({ children, fit, disabled, onClick }: Props) {
  const className =
    "p-4 text-xl font-bold text-center bg-green-700 shadow-md cursor-pointer select-none hover:bg-green-600 hover:shadow-lg";

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
        className={[className, fit ? "w-min" : "w-full"].join()}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
