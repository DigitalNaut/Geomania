import type { NonOAuthError } from "@react-oauth/google";
import { type PropsWithChildren, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import Button from "src/components/common/Button";

import DriveSettingsHook from "./DriveSettingsHook";

function AuthErrorMessage({ error }: { error: NonOAuthError }) {
  return (
    <span className="flex items-center gap-2">
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

function ErrorNotice({ error }: { error: NonOAuthError | Error }) {
  return (
    <div className="flex items-center gap-2 px-2 text-red-400">
      {error instanceof Error ? <span>Error: {error.message}</span> : <AuthErrorMessage error={error} />}
    </div>
  );
}

function InfoNotice({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function DriveIcon() {
  return (
    <img
      className="mx-1 inline-block h-4 w-4"
      src="https://fonts.gstatic.com/s/i/productlogos/drive_2020q4/v8/web-16dp/logo_drive_2020q4_color_2x_web_16dp.png"
      alt="Google Drive"
    />
  );
}

function useDriveAccess() {
  const { requestDriveAccess, disconnectDrive, isDriveLoaded, isDriveAuthorizing, hasDriveAccess, error } =
    useGoogleDriveContext();

  const { driveSettings, setAutoConnectDrive } = DriveSettingsHook();
  const { autoConnectDrive } = driveSettings;

  const handleAccessRequest = () => {
    requestDriveAccess();
  };

  const handleDisconnectDrive = () => {
    setAutoConnectDrive(false);
    disconnectDrive();
  };

  useEffect(() => {
    if (!isDriveLoaded || error) return;

    if (autoConnectDrive && !hasDriveAccess) requestDriveAccess();
  }, [requestDriveAccess, hasDriveAccess, autoConnectDrive, isDriveLoaded, error]);

  return {
    handleAccessRequest,
    isDriveLoaded,
    isDriveAuthorizing,
    hasDriveAccess,
    error,
    driveSettings,
    setAutoConnectDrive,
    handleDisconnectDrive,
  };
}

export function DriveAccessButton() {
  const { handleAccessRequest, handleDisconnectDrive, isDriveLoaded, isDriveAuthorizing, hasDriveAccess, error } =
    useDriveAccess();
  const { driveSettings } = DriveSettingsHook();

  let content: JSX.Element;

  if (error) {
    content = (
      <>
        <ErrorNotice error={error} />
        <Button onClick={handleAccessRequest}>Connect</Button>
      </>
    );
  } else if (!isDriveLoaded) {
    content = (
      <>
        Loading... <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </>
    );
  } else if (isDriveAuthorizing) {
    content = (
      <>
        Authorizing... <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </>
    );
  } else if (hasDriveAccess) {
    content = (
      <Button onClick={handleDisconnectDrive} styles="secondary">
        Disconnect
      </Button>
    );
  } else if (driveSettings.autoConnectDrive) {
    content = (
      <>
        Connecting... <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </>
    );
  } else {
    content = <Button onClick={handleAccessRequest}>Connect</Button>;
  }

  return <InfoNotice>{content}</InfoNotice>;
}

export function DriveAccessStatus() {
  const { isDriveLoaded, isDriveAuthorizing, hasDriveAccess, error } = useDriveAccess();
  const { driveSettings } = DriveSettingsHook();

  let content: JSX.Element;

  if (error) {
    content = (
      <>
        <DriveIcon />
        Drive error
        <FontAwesomeIcon className="mr-2 text-yellow-400" icon={faTriangleExclamation} />
      </>
    );
  } else if (!isDriveLoaded) {
    content = (
      <>
        <DriveIcon />
        Loading...
      </>
    );
  } else if (isDriveAuthorizing) {
    content = (
      <>
        <DriveIcon />
        Authorizing...
      </>
    );
  } else if (hasDriveAccess) {
    content = (
      <>
        <DriveIcon />
        Connected
      </>
    );
  } else if (driveSettings.autoConnectDrive) {
    content = (
      <>
        <DriveIcon />
        Connecting...
      </>
    );
  } else {
    content = (
      <>
        Use <DriveIcon /> Google Drive
      </>
    );
  }

  return (
    <InfoNotice>
      <Link to="/settings">
        <span className="flex items-center text-sm">{content}</span>
      </Link>
    </InfoNotice>
  );
}
