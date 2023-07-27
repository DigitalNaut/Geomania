import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet } from "react-router-dom";
import { faChartLine, faCog, faMap, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import MapContextProvider from "src/contexts/MapContext";
import CountryStoreProvider from "src/contexts/CountryStoreContext";
import UserGuessRecordProvider from "src/contexts/GuessRecordContext";
import MapActivity from "src/pages/MapActivity";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import PageNotFound from "src/pages/PageNotFound";
import Header, { HeaderLink } from "src/components/layout/Header";
import Footer from "src/components/layout/Footer";
import DriveAccess from "src/components/drive/DriveAccess";
import StandardLayout from "src/components/layout/StandardLayout";
import { useEdgeKeys } from "src/hooks/useEdgeKeys";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <StandardLayout>
          <Header>
            <div className="flex flex-1 gap-2 pl-6">
              <HeaderLink to="/" icon={faMap}>
                Map
              </HeaderLink>
              <HeaderLink to="dashboard" icon={faChartLine}>
                Dashboard
              </HeaderLink>
              <HeaderLink to="settings" icon={faCog}>
                Settings
              </HeaderLink>
            </div>

            <div className="flex w-full justify-end pl-2 text-sm">
              <DriveAccess />
            </div>
          </Header>

          <Outlet />

          <Footer />
        </StandardLayout>
      }
    >
      <Route
        element={
          <UserGuessRecordProvider historyLimit={200}>
            <Outlet />
          </UserGuessRecordProvider>
        }
      >
        <Route
          path="/"
          index
          element={
            <MapContextProvider>
              <CountryStoreProvider>
                <QueryClientProvider client={queryClient}>
                  <MapActivity />
                </QueryClientProvider>
              </CountryStoreProvider>
            </MapContextProvider>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Route>,
  ),
);

export default function App() {
  const { status, data } = useEdgeKeys();

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-white">
        <span>Loading...</span>
        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </div>
    );

  return (
    <GoogleOAuthProvider
      clientId={data?.clientId || "xxx"}
      onScriptLoadError={() => {
        throw new Error("Google OAuth script failed to load.");
      }}
    >
      <GoogleDriveProvider apiKey={data?.apiKey || ""}>
        <RouterProvider router={router} />
      </GoogleDriveProvider>
    </GoogleOAuthProvider>
  );
}
