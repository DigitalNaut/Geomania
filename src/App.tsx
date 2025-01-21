import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import type { PropsWithChildren } from "react";
import { lazy, Suspense } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import { Spinner } from "src/components/common/Spinner";
import Footer from "src/components/layout/Footer";
import Nav from "src/components/layout/Header";
import StandardLayout from "src/components/layout/StandardLayout";
import { CountryStoreProvider } from "src/context/CountryStore";
import { CountryFiltersProvider } from "src/context/FilteredCountryData";
import { HeaderControllerProvider } from "src/context/useHeaderController";
import { MapContextProvider } from "src/hooks/useMapContext";
import { store } from "src/store";

const LazyActivityMap = lazy(() => import("src/pages/ActivityMap"));
const LazySettings = lazy(() => import("src/pages/Settings"));
const LazyDashboard = lazy(() => import("src/pages/Dashboard"));
const LazyPageNotFound = lazy(() => import("src/pages/PageNotFound"));

const queryClient = new QueryClient();

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <ReduxProvider store={store}>
          <HeaderControllerProvider>
            <CountryFiltersProvider>
              <CountryStoreProvider>
                <Suspense fallback={<Spinner cover />}>{children}</Suspense>
              </CountryStoreProvider>
            </CountryFiltersProvider>
          </HeaderControllerProvider>
        </ReduxProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

function Layout() {
  return (
    <StandardLayout>
      <Nav>
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

        <Nav.Logo title="Geomaniac" />
      </Nav>

      <Outlet />

      <Footer />
    </StandardLayout>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/:activity?/:kind?"
            index
            element={
              <MapContextProvider>
                <LazyActivityMap />
              </MapContextProvider>
            }
          />
          <Route path="/settings" element={<LazySettings />} />
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/*" element={<LazyPageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}
