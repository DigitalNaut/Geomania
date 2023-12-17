import { type PropsWithChildren } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import useEdgeKeys from "src/hooks/useEdgeKeys";

/**
 * Fetches keys from the Netlify Edge API and passes them to the Google Providers.
 */
export function NetlifyDriveIntegrationProvider({ children }: PropsWithChildren) {
  const { data } = useEdgeKeys();

  return (
    <GoogleOAuthProvider
      clientId={data?.clientId || ""}
      onScriptLoadError={() => {
        throw new Error("Google OAuth script failed to load.");
      }}
    >
      <GoogleDriveProvider apiKey={data?.apiKey}>{children}</GoogleDriveProvider>
    </GoogleOAuthProvider>
  );
}
