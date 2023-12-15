import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet } from "react-router-dom";
import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { ConditionalDriveProvider } from "src/components/drive/ConditionalDriveProvider";
import HeaderControllerProvider from "./contexts/HeaderControllerContext";
import MapContextProvider from "src/contexts/MapContext";
import CountryStoreProvider from "src/contexts/CountryStoreContext";
import CountryFiltersProvider from "src/contexts/CountryFiltersContext";
import UserGuessRecordProvider from "src/contexts/GuessRecordContext";
import MapActivityProvider from "src/contexts/MapActivityContext";
import UserSettingsProvider from "src/contexts/UserSettingsContext";
import MapActivity from "src/pages/MapActivity";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import PageNotFound from "src/pages/PageNotFound";
import Header from "src/components/layout/Header";
import Footer from "src/components/layout/Footer";
// import DriveAccess from "src/components/drive/DriveAccess";
import StandardLayout from "src/components/layout/StandardLayout";
import ErrorFallback from "src/components/common/ErrorFallback";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <StandardLayout>
          <Header>
            <Header.Logo title="Geomaniac" />

            <div className="flex flex-1 gap-2 pl-6">
              <Header.Link to="/" icon={faMap}>
                Map
              </Header.Link>
              <Header.Link to="dashboard" icon={faChartLine}>
                Dashboard
              </Header.Link>
              <Header.Link to="settings" icon={faCog}>
                Settings
              </Header.Link>
            </div>

            <div className="flex w-full justify-end pl-2 text-sm">
              <ErrorBoundary fallback={<span className="px-2 italic text-white/60">Google Drive not available.</span>}>
                {/* <DriveAccess /> */}
              </ErrorBoundary>
            </div>
          </Header>

          <Outlet />

          <Footer />
        </StandardLayout>
      }
    >
      <Route
        element={
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <QueryClientProvider client={queryClient}>
              <UserGuessRecordProvider historyLimit={200}>
                <CountryFiltersProvider>
                  <Outlet />
                </CountryFiltersProvider>
              </UserGuessRecordProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        }
      >
        <Route
          path="/"
          index
          element={
            <MapContextProvider>
              <CountryStoreProvider>
                <MapActivityProvider>
                  <MapActivity />
                </MapActivityProvider>
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
  return (
    <HeaderControllerProvider>
      <UserSettingsProvider>
        <ConditionalDriveProvider>
          <RouterProvider router={router} />
        </ConditionalDriveProvider>
      </UserSettingsProvider>
    </HeaderControllerProvider>
  );
}
