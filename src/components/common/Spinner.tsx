import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center gap-2 text-white">
      <span>Loading...</span>
      <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
    </div>
  );
}
