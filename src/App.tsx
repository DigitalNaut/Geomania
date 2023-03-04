import MapContextProvider from "src/contexts/MapContext";
import MapVisitor from "src/pages/MapVisitor";
import Header from "src/components/Header";
import Footer from "src/components/Footer";
import DriveAccess from "src/components/DriveAccess";

export default function App() {
  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      <Header>
        <div className="flex w-full justify-end pl-2 text-sm">
          <DriveAccess />
        </div>
      </Header>

      <MapContextProvider>
        <MapVisitor />
      </MapContextProvider>

      <Footer />
    </div>
  );
}
