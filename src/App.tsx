import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  faChartLine,
  faCog,
  faMap,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleDriveProvider } from "src/contexts/GoogleDriveContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import MapContextProvider from "src/contexts/MapContext";
import CountryStoreProvider from "src/contexts/CountryStoreContext";
import UserGuessRecordProvider from "src/contexts/GuessRecordContext";
import Header, { HeaderLink } from "src/components/layout/Header";
import MapActivity from "src/pages/MapActivity";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import Footer from "src/components/layout/Footer";
import PageNotFound from "src/pages/PageNotFound";
import DriveAccess from "src/components/drive/DriveAccess";
import StandardLayout from "src/components/layout/StandardLayout";

const queryClient = new QueryClient();

console.log(PACKAGE_VERSION);

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

            <div>v{PACKAGE_VERSION}</div>

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
    </Route>
  )
);

export default function App() {
  const { data, status } = useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const response = await fetch("/api/keys");
      const text = await response.text();
      const keys = JSON.parse(text);

      return keys;
    },
  });

  const { apiKey, clientId } = data || {};

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-white">
        <span>Loading...</span>
        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
      </div>
    );

  if (!clientId || !apiKey) throw new Error("Missing configuration.");

  return (
    <GoogleOAuthProvider
      clientId={clientId}
      onScriptLoadError={() => {
        throw new Error("Google OAuth script failed to load.");
      }}
    >
      <GoogleDriveProvider apiKey={apiKey}>
        <RouterProvider router={router} />
      </GoogleDriveProvider>
    </GoogleOAuthProvider>
  );
}
