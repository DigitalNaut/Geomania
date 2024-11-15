import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import ErrorFallback from "src/components/common/ErrorFallback";
import { Spinner } from "src/components/common/Spinner";
import Footer from "src/components/layout/Footer";
import Nav from "src/components/layout/Header";
import StandardLayout from "src/components/layout/StandardLayout";
import { CountryFiltersProvider } from "src/hooks/useCountryFilters";
import { CountryStoreProvider } from "src/hooks/useCountryStore";
import { HeaderControllerProvider } from "src/hooks/useHeaderController";
import { MapActivityProvider } from "src/hooks/useMapActivity";
import { MapContextProvider } from "src/hooks/useMapContext";
import { UserGuessRecordProvider } from "src/hooks/useUserGuessRecord";
import { UserSettingsProvider } from "src/hooks/useUserSettings";

const LazyActivityMap = lazy(() => import("src/pages/ActivityMap"));
const LazySettings = lazy(() => import("src/pages/Settings"));
const LazyDashboard = lazy(() => import("src/pages/Dashboard"));
const LazyPageNotFound = lazy(() => import("src/pages/PageNotFound"));

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    {
      element: (
        <StandardLayout>
          <Nav>
            <Nav.Logo title="Geomaniac" />

            <div className="flex flex-1 gap-2 pl-6">
              <Nav.Link to="/" icon={faMap}>
                Map
              </Nav.Link>
              <Nav.Link to="../dashboard" icon={faChartLine}>
                Dashboard
              </Nav.Link>
              <Nav.Link to="../settings" icon={faCog}>
                Settings
              </Nav.Link>
            </div>
          </Nav>

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
                  <LazyActivityMap />
                </MapContextProvider>
              ),
            },
            {
              path: "settings",
              element: <LazySettings />,
            },
            {
              path: "dashboard",
              element: <LazyDashboard />,
            },
          ],
        },
        {
          path: "*",
          element: <LazyPageNotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_partialHydration: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export default function App() {
  return (
    <HeaderControllerProvider>
      <UserSettingsProvider>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </UserSettingsProvider>
    </HeaderControllerProvider>
  );
}
