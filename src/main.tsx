import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import ErrorFallback from "src/components/common/ErrorFallback";
import App from "src/App";

import "src/styles/output.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        onScriptLoadError={() => {
          throw new Error("Google OAuth script failed to load.");
        }}
      >
        <GoogleDriveProvider>
          <App />
        </GoogleDriveProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
