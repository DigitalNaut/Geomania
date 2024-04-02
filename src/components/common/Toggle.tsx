import { twMerge } from "tailwind-merge";

type ToggleProps = {
  id?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
};

export default function Toggle({ id, value = false, onChange, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      className={twMerge(
        "h-4 w-8 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        value ? "bg-blue-500" : "bg-gray-500",
      )}
      onClick={() => {
        onChange?.(!value);
      }}
      disabled={disabled}
    >
      <div
        className={twMerge(
          "z-0 aspect-square h-4 rounded-full bg-gray-200 transition-transform hover:bg-white",
          value ? "translate-x-full" : "translate-x-0",
        )}
      />
    </button>
  );
}
