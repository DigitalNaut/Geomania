import type { NonOAuthError } from "@react-oauth/google";
import { type PropsWithChildren, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import { useUserSettingsContext } from "src/contexts/UserSettingsContext";
import Button from "src/components/common/Button";

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
  const { requestDriveAccess, disconnectDrive, isDriveLoaded, hasDriveAccess, error } = useGoogleDriveContext();
  const { userSettings, setUserSetting } = useUserSettingsContext();

  const handleDisconnectDrive = () => {
    setUserSetting({ autoConnectDrive: false });
    disconnectDrive();
  };

  useEffect(() => {
    if (!isDriveLoaded || error) return;

    if (userSettings.autoConnectDrive && !hasDriveAccess)
      // TODO: Remove workaround
      // * Firefox throws an error "Should not already be working." but works in Chrome.
      // * This is an open bug in react. The blocking call `window.open` within the useState hook messes with React's synchronization of the state.
      // ? See: https://github.com/facebook/react/issues/17355
      // ? See: https://stackoverflow.com/questions/76944918/should-not-already-be-working-on-window-open-in-simple-react-app
      setTimeout(() => requestDriveAccess(), 0);
  }, [requestDriveAccess, hasDriveAccess, userSettings.autoConnectDrive, isDriveLoaded, error]);

  return {
    handleDisconnectDrive,
  };
}

export function DriveAccessButton() {
  const { isDriveAuthorizing, isDriveLoaded, hasDriveAccess, requestDriveAccess, error } = useGoogleDriveContext();
  const { handleDisconnectDrive } = useDriveAccess();

  let content: JSX.Element;

  if (error) {
    content = (
      <>
        <ErrorNotice error={error} />
        <Button onClick={requestDriveAccess}>Connect</Button>
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
  } else {
    content = <Button onClick={requestDriveAccess}>Connect</Button>;
  }

  return <InfoNotice>{content}</InfoNotice>;
}

export function DriveAccessStatus() {
  const { isDriveAuthorizing, isDriveLoaded, hasDriveAccess, error } = useGoogleDriveContext();

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
