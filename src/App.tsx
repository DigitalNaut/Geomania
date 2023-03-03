import { ErrorBoundary } from "react-error-boundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import MapVisitor from "src/pages/MapVisitor";
import Header from "src/components/Header";
import Footer from "src/components/Footer";
import MapContextProvider from "src/contexts/MapContext";
import ErrorFallback from "src/components/ErrorFallback";
// import { UserProvider } from "src/contexts/UserContext";
import DriveAccess from "src/components/DriveAccess";

export default function App() {
  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* <UserProvider> */}
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
          onScriptLoadError={() => {
            throw new Error("Google OAuth script failed to load.");
          }}
        >
          <GoogleDriveProvider>
            <Header>
              <div className="flex w-full justify-end pl-2 text-sm">
                <DriveAccess />
              </div>
            </Header>
            <MapContextProvider>
              <MapVisitor />
            </MapContextProvider>
          </GoogleDriveProvider>
        </GoogleOAuthProvider>
        {/* </UserProvider> */}
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
