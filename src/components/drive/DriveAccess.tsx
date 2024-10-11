import type { NonOAuthError } from "@react-oauth/google";
import { type PropsWithChildren, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { useGoogleDriveContext } from "src/hooks/useGoogleDrive";
import { useUserSettingsContext } from "src/hooks/useUserSettings";
import Button from "src/components/common/Button";
import DriveIcon from "src/components/drive/DriveIcon";

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

function ErrorLabel({ error }: { error: NonOAuthError | Error }) {
  return (
    <div className="flex items-center gap-2 px-2 text-red-400">
      {error instanceof Error ? <span>Error: {error.message}</span> : <AuthErrorMessage error={error} />}
    </div>
  );
}

function InfoLabel({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function useDriveAccess() {
  const { requestDriveAccess, disconnectDrive, state } = useGoogleDriveContext();
  const { userSettings, setUserSetting } = useUserSettingsContext();

  const handleDisconnectDrive = () => {
    setUserSetting({ autoConnectDrive: false });
    disconnectDrive();
  };

  useEffect(() => {
    if (state.status !== "loaded" || !userSettings.autoConnectDrive) return;

    // TODO: Remove workaround
    // * Firefox throws an error "Should not already be working." but works in Chrome.
    // * This is an open bug in react. The blocking call `window.open` within the useState hook messes with React's synchronization of the state.
    // ? See: https://github.com/facebook/react/issues/17355
    // ? See: https://stackoverflow.com/questions/76944918/should-not-already-be-working-on-window-open-in-simple-react-app

    setTimeout(() => requestDriveAccess(), 0);
  }, [requestDriveAccess, state, userSettings.autoConnectDrive]);

  return {
    handleDisconnectDrive,
  };
}

export function DriveAccessButton() {
  const { state, requestDriveAccess } = useGoogleDriveContext();
  const { status } = state;
  const { handleDisconnectDrive } = useDriveAccess();
  const { userSettings } = useUserSettingsContext();

  let content: JSX.Element | null = null;

  if (status === "error") {
    content = (
      <>
        <ErrorLabel error={state.error} />
        <Button onClick={requestDriveAccess}>Connect</Button>
      </>
    );
  } else if (status === "access") {
    content = (
      <Button onClick={handleDisconnectDrive} styles="secondary">
        Disconnect
      </Button>
    );
  } else if (status === "unauthorized") {
    content = (
      <>
        Authorizing... <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </>
    );
  } else if (!userSettings.autoConnectDrive && status === "loaded") {
    content = <Button onClick={requestDriveAccess}>Connect</Button>;
  } else if (userSettings.autoConnectDrive || status === "idle") {
    content = (
      <>
        Loading... <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </>
    );
  }

  return <InfoLabel>{content}</InfoLabel>;
}

export function DriveAccessStatus() {
  useDriveAccess();
  const { state } = useGoogleDriveContext();
  const { status } = state;
  const { userSettings } = useUserSettingsContext();

  let content: JSX.Element | null = null;

  if (status === "error") {
    content = (
      <>
        <DriveIcon />
        Drive error
        <FontAwesomeIcon className="mr-2 text-yellow-400" icon={faTriangleExclamation} />
      </>
    );
  } else if (status === "access") {
    content = (
      <>
        <DriveIcon />
        Connected
      </>
    );
  } else if (status === "unauthorized") {
    content = (
      <>
        <DriveIcon />
        Authorizing...
      </>
    );
  } else if (!userSettings.autoConnectDrive && status === "loaded") {
    content = (
      <>
        Use <DriveIcon /> Google Drive
      </>
    );
  } else if (userSettings.autoConnectDrive || status === "idle") {
    content = (
      <>
        <DriveIcon />
        Loading...
      </>
    );
  }

  return (
    <InfoLabel>
      <Link to="/settings">
        <span className="flex items-center text-sm">{content}</span>
      </Link>
    </InfoLabel>
  );
}
