import type { PropsWithChildren } from "react";
import type { NonOAuthError } from "@react-oauth/google";
import {
  faCircleCheck,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/contexts/GoogleDriveContext";

type NonDriveErrorMessageProps = {
  error: NonOAuthError;
};

function NonDriveErrorMessage({ error }: NonDriveErrorMessageProps) {
  return (
    <span className="flex items-center gap-2">
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
    </span>
  );
}

type ErrorNoticeProps = PropsWithChildren & {
  retry: () => void;
};

function ErrorNotice({ children, retry }: ErrorNoticeProps) {
  return (
    <div className="flex items-center rounded-md bg-red-900">
      <div className="flex items-center gap-2 px-2">{children}</div>
      <Button onClick={retry}>Retry</Button>
    </div>
  );
}

function InfoNotice({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-1">{children}</div>;
}

type ButtonProps = PropsWithChildren & {
  onClick: () => void;
};

function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      className="rounded-sm bg-blue-500 py-1 px-2 text-white"
      role="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function DriveAccess() {
  const [rememberAutoConnect, setRememberAutoConnect] = useState(true);
  const {
    requestDriveAccess,
    disconnectDrive,
    isDriveLoaded,
    isDriveAuthorizing,
    hasDriveAccess,
    nonDriveError,
    error,
  } = useGoogleDrive();

  const autoConnectDrive = localStorage.getItem("autoConnectDrive");

  const handleAccessRequest = () => {
    if (rememberAutoConnect) {
      localStorage.setItem("autoConnectDrive", "true");
    }
    requestDriveAccess();
  };

  const handleDisconnectDrive = () => {
    localStorage.removeItem("autoConnectDrive");
    disconnectDrive();
  };

  useEffect(() => {
    if (!isDriveLoaded || nonDriveError) return;

    if (autoConnectDrive === "true" && !hasDriveAccess) {
      requestDriveAccess();
      return;
    }
  }, [
    requestDriveAccess,
    hasDriveAccess,
    isDriveLoaded,
    nonDriveError,
    autoConnectDrive,
  ]);

  if (!isDriveLoaded) {
    return (
      <InfoNotice>
        Loading
        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </InfoNotice>
    );
  }

  if (error) {
    return (
      <ErrorNotice retry={handleAccessRequest}>
        Error: {error.message}
      </ErrorNotice>
    );
  }

  if (nonDriveError) {
    return (
      <ErrorNotice retry={handleAccessRequest}>
        <NonDriveErrorMessage error={nonDriveError} />
      </ErrorNotice>
    );
  }

  if (isDriveAuthorizing) {
    return (
      <InfoNotice>
        Authorizing Google Drive
        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </InfoNotice>
    );
  }

  if (hasDriveAccess) {
    return (
      <InfoNotice>
        Connected to Drive
        <FontAwesomeIcon icon={faCircleCheck} />
        <Button onClick={handleDisconnectDrive}>Disconnect</Button>
      </InfoNotice>
    );
  }

  if (autoConnectDrive === "true") {
    return (
      <InfoNotice>
        Connecting to Drive
        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </InfoNotice>
    );
  }

  return (
    <InfoNotice>
      <input
        id="drive-checkbox"
        type="checkbox"
        checked={rememberAutoConnect}
        onChange={(e) => setRememberAutoConnect(e.target.checked)}
      />
      <label htmlFor="drive-checkbox">Remember this choice</label>
      <Button onClick={handleAccessRequest}>Connect to Drive</Button>
    </InfoNotice>
  );
}
