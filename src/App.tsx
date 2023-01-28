import MapVisitor from "src/pages/MapVisitor";
import Header from "src/components/Title";
import MapContextProvider from "src/controllers/MapContext";

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Header>Geomania</Header>
      <MapContextProvider>
        <MapVisitor />
      </MapContextProvider>
    </div>
  );
}
