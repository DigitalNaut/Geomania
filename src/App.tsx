import MapVisitor from "src/pages/MapVisitor";
import Header from "src/components/Header";
import MapContextProvider from "src/controllers/MapContext";

export default function App() {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <MapContextProvider>
        <MapVisitor />
      </MapContextProvider>
    </div>
  );
}
