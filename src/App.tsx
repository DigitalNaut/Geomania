import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet } from "react-router-dom";
import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { ConditionalDriveProvider } from "src/components/drive/ConditionalDriveProvider";
import MapContextProvider from "src/contexts/MapContext";
import CountryStoreProvider from "src/contexts/CountryStoreContext";
import CountryFiltersProvider from "./contexts/CountryFiltersContext";
import UserGuessRecordProvider from "src/contexts/GuessRecordContext";
import MapActivity from "src/pages/MapActivity";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import PageNotFound from "src/pages/PageNotFound";
import Header, { HeaderLink } from "src/components/layout/Header";
import Footer from "src/components/layout/Footer";
import DriveAccess from "src/components/drive/DriveAccess";
import StandardLayout from "src/components/layout/StandardLayout";
import ErrorFallback from "src/components/common/ErrorFallback";

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
              <ErrorBoundary fallback={<span className="px-2 italic text-white/60">Google Drive not available.</span>}>
                <DriveAccess />
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
                <MapActivity />
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
    <ConditionalDriveProvider>
      <RouterProvider router={router} />
    </ConditionalDriveProvider>
  );
}
