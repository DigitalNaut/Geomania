import type { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

type ActionButtonProps = Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type">;

export function ActionButton({ children, className, disabled, onClick, ...props }: ActionButtonProps) {
  return (
    <div className="relative bg-clip-content">
      {disabled && <div className={`absolute h-full w-full bg-green-900 ${disabled ? "opacity-70" : "opacity-0"}`} />}
      <button
        disabled={disabled}
        className={`cursor-pointer select-none bg-green-600 p-4 text-center text-xl font-bold shadow-md hover:bg-green-500 hover:shadow-lg ${className}`}
        onClick={onClick}
        type="button"
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
