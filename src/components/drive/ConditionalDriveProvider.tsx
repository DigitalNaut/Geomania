import { type PropsWithChildren } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { useEdgeKeys } from "src/hooks/useEdgeKeys";
import { Spinner } from "src/components/common/Spinner";

export function ConditionalDriveProvider({ children }: PropsWithChildren) {
  const { status, data } = useEdgeKeys();

  if (status === "pending") return <Spinner />;

  const { clientId, apiKey } = data || {};
  const isDriveEnabled = !!clientId && !!apiKey;

  if (status === "error" || !isDriveEnabled) return children;

  return (
    <GoogleOAuthProvider
      clientId={clientId}
      onScriptLoadError={() => {
        throw new Error("Google OAuth script failed to load.");
      }}
    >
      <GoogleDriveProvider apiKey={apiKey}>{children}</GoogleDriveProvider>
    </GoogleOAuthProvider>
  );
}
