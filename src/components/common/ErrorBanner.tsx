import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ErrorBanner({ error, dismissError }: { error: Error; dismissError: () => void }) {
  return (
    <div className="flex w-full flex-[0] justify-center bg-red-800 p-2">
      <div className="flex gap-6">
        {error.message}
        <button role="button" title="Dismiss" onClick={dismissError}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}
