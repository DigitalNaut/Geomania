import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { Outlet } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import MapContextProvider from "src/contexts/MapContext";
import { UserGuessRecordProvider } from "src/contexts/GuessRecordContext";
import Header, { HeaderLink } from "src/components/Header";
import MapActivity from "src/pages/MapActivity";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import Footer from "src/components/Footer";
import PageNotFound from "src/pages/PageNotFound";
import DriveAccess from "src/components/DriveAccess";
import StandardLayout from "src/components/StandardLayout";

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
              <QueryClientProvider client={queryClient}>
                <MapActivity />
              </QueryClientProvider>
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
  return <RouterProvider router={router} />;
}
