import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SpinnerProps = {
  message?: string;
};

export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-white">
      <span>Loading {message}...</span>
      <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
    </div>
  );
}
