import {
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NonOAuthError } from "@react-oauth/google";
import { useCallback, useEffect } from "react";

import { useGoogleDrive } from "src/contexts/GoogleDriveContext";

function useDriveFileList() {
  const {
    fetchFileList,
    requestDriveAccess,
    isDriveLoaded,
    isDriveAuthorizing,
    hasDriveAccess,
    nonDriveError,
    error,
  } = useGoogleDrive();
  // const [fileList, setFileList] = useState<gapi.client.drive.FileList>();

  const fetchList = useCallback(
    async () => await fetchFileList(),
    [fetchFileList]
  );

  useEffect(() => {
    const tryFetchList = async () => {
      if (!isDriveLoaded || nonDriveError) return;

      if (!hasDriveAccess) {
        requestDriveAccess();
        return;
      }

      try {
        console.log("Fetching data...", hasDriveAccess);
        const { data } = await fetchList();
        console.log("Data received:", data);
      } catch (error) {
        if (error instanceof Error && error.message !== "Authorizing.")
          throw error;
      }
    };

    tryFetchList();
  }, [
    fetchList,
    requestDriveAccess,
    hasDriveAccess,
    isDriveLoaded,
    nonDriveError,
  ]);

  return {
    isLoading: !isDriveLoaded,
    isDriveAuthorizing,
    hasDriveAccess,
    nonDriveError,
    error,
    retryAccess: requestDriveAccess,
  };
}

type NonDriveErrorMessageProps = {
  error: NonOAuthError;
  retry: () => void;
};

function NonDriveErrorMessage({ error, retry }: NonDriveErrorMessageProps) {
  return (
    <div className="flex items-center rounded-md bg-red-900">
      <div className="flex items-center gap-2 px-2">
        <FontAwesomeIcon
          className="text-yellow-300"
          icon={faTriangleExclamation}
        />
        {error.type === "popup_closed" ? (
          <span>Popup window closed before authorization completed.</span>
        ) : error.type === "popup_failed_to_open" ? (
          <span>Popup window blocked. Please allow popups for this site.</span>
        ) : (
          <span>An unknown error occurred.</span>
        )}
      </div>
      <button
        className="rounded-sm bg-blue-500 py-1 px-2 text-white"
        role="button"
        onClick={retry}
      >
        Retry
      </button>
    </div>
  );
}

export default function DriveAccess() {
  const {
    isDriveAuthorizing,
    hasDriveAccess,
    isLoading,
    nonDriveError,
    retryAccess,
    error,
  } = useDriveFileList();

  if (isLoading) return <div>Loading...</div>;

  if (error)
    return (
      <div className="rounded-md bg-red-500 p-1 text-white">
        Error: {error.message}
      </div>
    );

  if (nonDriveError)
    return <NonDriveErrorMessage error={nonDriveError} retry={retryAccess} />;

  if (isDriveAuthorizing)
    return <div className="text-white">Authorizing Google Drive...</div>;

  return (
    <div className="text-white">
      {hasDriveAccess ? (
        <span className="flex items-center gap-1">
          Connected to Drive
          <FontAwesomeIcon icon={faCircleCheck} />
        </span>
      ) : (
        <span>No access to Drive</span>
      )}
    </div>
  );
}
