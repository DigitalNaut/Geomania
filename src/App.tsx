import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { DriveAccessStatus } from "src/components/drive/DriveAccess";
import { ManagedDriveProvider } from "src/components/drive/DriveIntegration";
import { Spinner } from "src/components/common/Spinner";
import CountryFiltersProvider from "src/contexts/CountryFiltersContext";
import CountryStoreProvider from "src/contexts/CountryStoreContext";
import ErrorFallback from "src/components/common/ErrorFallback";
import Footer from "src/components/layout/Footer";
import Header from "src/components/layout/Header";
import HeaderControllerProvider from "./contexts/HeaderControllerContext";
import MapActivityProvider from "src/contexts/MapActivityContext";
import MapContextProvider from "src/contexts/MapContext";
import StandardLayout from "src/components/layout/StandardLayout";
import UserGuessRecordProvider from "src/contexts/GuessRecordContext";
import UserSettingsProvider from "src/contexts/UserSettingsContext";

const LazyMapActivity = lazy(() => import("src/pages/MapActivity"));
const LazySettings = lazy(() => import("src/pages/Settings"));
const LazyDashboard = lazy(() => import("src/pages/Dashboard"));
const LazyPageNotFound = lazy(() => import("src/pages/PageNotFound"));

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
            {/* {import.meta.env.DEV && (
              <Header.Link to="drive" icon={faFlask}>
                Drive
              </Header.Link>
            )} */}
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
              <UserGuessRecordProvider historyLimit={10}>
                <CountryFiltersProvider>
                  <CountryStoreProvider>
                    <MapActivityProvider>
                      <Suspense fallback={<Spinner cover />}>
                        <Outlet />
                      </Suspense>
                    </MapActivityProvider>
                  </CountryStoreProvider>
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
                <LazyMapActivity />
              </MapContextProvider>
            ),
          },
          {
            path: "/settings",
            element: <LazySettings />,
          },
          {
            path: "/dashboard",
            element: <LazyDashboard />,
          },
          // {
          //   path: "/drive",
          //   element: <DriveTestPage />,
          // },
        ],
      },
      {
        path: "*",
        element: <LazyPageNotFound />,
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
