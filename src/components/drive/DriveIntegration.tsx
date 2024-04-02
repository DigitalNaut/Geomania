import { type PropsWithChildren } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { useUserSettingsContext } from "src/contexts/UserSettingsContext";
import useEdgeKeys from "src/hooks/useEdgeKeys";

/**
 * Fetches keys from the Netlify Edge API and passes them to the Google Providers.
 */
export function ManagedDriveProvider({ children }: PropsWithChildren) {
  const { data } = useEdgeKeys();
  const { setUserSetting } = useUserSettingsContext();

  const userDisconnectHandler = () => {
    setUserSetting({ autoConnectDrive: false });
  };

  return (
    <GoogleOAuthProvider
      clientId={data?.clientId ?? ""}
      onScriptLoadError={() => {
        throw new Error("Google OAuth script failed to load.");
      }}
    >
      <GoogleDriveProvider apiKey={data?.apiKey} onUserDisconnect={userDisconnectHandler}>
        {children}
      </GoogleDriveProvider>
    </GoogleOAuthProvider>
  );
}
