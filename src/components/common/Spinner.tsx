import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

type SpinnerProps = {
  message?: string;
  className?: string;
  cover?: true;
};

export function Spinner({ message, className, cover }: SpinnerProps) {
  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-2 text-white",
        cover && "flex h-full items-center justify-center",
        className,
      )}
    >
      <span>Loading {message}...</span>
      <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
    </div>
  );
}
