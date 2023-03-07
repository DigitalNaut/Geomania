import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCog, faMap } from "@fortawesome/free-solid-svg-icons";
import { Outlet } from "react-router-dom";

import MapContextProvider from "src/contexts/MapContext";
import { UserGuessRecordProvider } from "src/contexts/GuessRecordContext";
import Header, { HeaderLink } from "src/components/Header";
import MapVisitor from "src/pages/MapVisitor";
import Settings from "src/pages/Settings";
import Dashboard from "src/pages/Dashboard";
import Footer from "src/components/Footer";
import PageNotFound from "src/pages/PageNotFound";
import DriveAccess from "src/components/DriveAccess";
import StandardLayout from "src/components/StandardLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <StandardLayout>
          <Header>
            <div className="flex flex-1 pl-6">
              <HeaderLink to="/">
                <FontAwesomeIcon icon={faMap} />
                Map
              </HeaderLink>
              <HeaderLink to="dashboard">
                <FontAwesomeIcon icon={faChartLine} />
                Dashboard
              </HeaderLink>
              <HeaderLink to="settings">
                <FontAwesomeIcon icon={faCog} />
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
              <MapVisitor />
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
