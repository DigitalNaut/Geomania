import { ErrorBoundary } from "react-error-boundary";

import MapVisitor from "src/pages/MapVisitor";
import Header from "src/components/Header";
import Footer from "src/components/Footer";
import MapContextProvider from "src/controllers/MapContext";
import ErrorFallback from "src/components/ErrorFallback";

export default function App() {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MapContextProvider>
          <MapVisitor />
        </MapContextProvider>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
