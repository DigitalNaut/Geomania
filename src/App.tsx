import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { faChartLine, faCog, faFlask, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { ManagedDriveProvider } from "src/components/drive/DriveIntegration";
import { DriveAccessStatus } from "src/components/drive/DriveAccess";
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
import DriveTestPage from "src/pages/DriveTesting";
import Header from "src/components/layout/Header";
import Footer from "src/components/layout/Footer";
import StandardLayout from "src/components/layout/StandardLayout";
import ErrorFallback from "src/components/common/ErrorFallback";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: (
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
            {import.meta.env.DEV && (
              <Header.Link to="drive" icon={faFlask}>
                Drive
              </Header.Link>
            )}
          </div>

          <div className="flex w-full justify-end pl-2 text-sm">
            <DriveAccessStatus />
          </div>
        </Header>

        <Outlet />

        <Footer />
      </StandardLayout>
    ),
    children: [
      {
        element: (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <QueryClientProvider client={queryClient}>
              <UserGuessRecordProvider historyLimit={200}>
                <CountryFiltersProvider>
                  <Outlet />
                </CountryFiltersProvider>
              </UserGuessRecordProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        ),
        children: [
          {
            path: "/",
            index: true,
            element: (
              <MapContextProvider>
                <CountryStoreProvider>
                  <MapActivityProvider>
                    <MapActivity />
                  </MapActivityProvider>
                </CountryStoreProvider>
              </MapContextProvider>
            ),
          },
          {
            path: "/settings",
            element: <Settings />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/drive",
            element: <DriveTestPage />,
          },
        ],
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

export default function App() {
  return (
    <HeaderControllerProvider>
      <UserSettingsProvider>
        <ManagedDriveProvider>
          <RouterProvider router={router} />
        </ManagedDriveProvider>
      </UserSettingsProvider>
    </HeaderControllerProvider>
  );
}
