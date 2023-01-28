import MapVisitor from 'src/pages/MapVisitor';
import Header from 'src/components/Title';
import MapContextProvider from 'src/controllers/MapContext';

export default function App() {
  return (
    <div className="grid h-screen grid-rows-[auto,1fr]">
      <Header>Geomania</Header>
      <MapContextProvider>
        <MapVisitor />
      </MapContextProvider>
    </div>
  );
}