import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { Outlet } from "react-router-dom";

import MapContextProvider from "src/contexts/MapContext";
import MapVisitor from "src/pages/MapVisitor";
import Settings from "src/pages/Settings";
import Header, { HeaderLink } from "src/components/Header";
import Footer from "src/components/Footer";
import DriveAccess from "src/components/DriveAccess";
import StandardLayout from "src/components/StandardLayout";
import PageNotFound from "src/pages/PageNotFound";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <StandardLayout>
          <Header>
            <HeaderLink to="settings">
              <FontAwesomeIcon icon={faCog} />
              Settings
            </HeaderLink>
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
        path="/"
        index
        element={
          <MapContextProvider>
            <MapVisitor />
          </MapContextProvider>
        }
      />
      <Route path="/settings" element={<Settings />} />

      <Route path="*" element={<PageNotFound />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
