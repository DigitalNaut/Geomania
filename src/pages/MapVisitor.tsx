import { useMemo } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { getAllCountryFeatures } from "src/controllers/MapController";
import { MapClick } from "src/components/MapClick";
import { LeafletMap, markerIcon } from "src/components/LeafletMap";
import { useMapVisitor } from "src/pages/MapVisitor.hooks";
import GuessHistoryPanel from "src/components/GuessHistoryPanel";
import UserGuessFloatingPanel from "src/components/UserGuessFloatingPanel";
import FloatingHeader from "src/components/FloatingHeader";
import InstructionOverlay from "src/components/InstructionOverlay";

export default function MapVisitor() {
  const visitor = useMapVisitor();
  const {
    handleMapClick,
    countryCorrectAnswer,
    isReady,
    error,
    dismissError,
    guessHistory,
  } = visitor;

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);

  return (
    <>
      {error?.message && (
        <div className="flex w-full flex-[0] justify-center bg-red-800 p-2">
          <div className="flex gap-6">
            {error.message}
            <button role="button" title="Dismiss" onClick={dismissError}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <main className="flex flex-1 px-2 pt-2">
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-inner">
          <LeafletMap>
            <MapClick callback={handleMapClick} />
            {countryCorrectAnswer.coordinates && (
              <Marker
                position={countryCorrectAnswer.coordinates}
                icon={markerIcon}
              />
            )}

            {allCountryFeatures.map((feature) => {
              const isAnswer =
                feature.properties?.ISO_A3 ===
                countryCorrectAnswer.data?.alpha3;

              return (
                <GeoJSON
                  key={feature.properties?.ADMIN}
                  data={feature}
                  style={{
                    fillColor:
                      countryCorrectAnswer.data && isAnswer
                        ? "#fcd34d"
                        : "#94a3b8",
                    fillOpacity: 1,
                    color: "white",
                    weight: 1,
                    interactive: false,
                  }}
                />
              );
            })}
          </LeafletMap>

          {isReady ? (
            <FloatingHeader>Guess the country!</FloatingHeader>
          ) : (
            <InstructionOverlay>Click to start</InstructionOverlay>
          )}

          <UserGuessFloatingPanel visitor={visitor} />
        </div>

        <GuessHistoryPanel history={guessHistory} />
      </main>
    </>
  );
}
