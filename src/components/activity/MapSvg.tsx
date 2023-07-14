import type { LatLngBoundsExpression, LeafletEventHandlerFnMap } from "leaflet";
import { useState } from "react";

import { latLng, latLngBounds } from "leaflet";
import { SVGOverlay, useMapEvents } from "react-leaflet";

import mapSvg from "src/assets/images/world-map-mercator.svg?raw";
import { useMapContext } from "src/contexts/MapContext";

const viewBoxParser = /viewBox="(.+?)"/g;
const attributesParser = /<path d="(.+?)" A3="(.+?)" ADMIN="(.+?)"\/>/g;
const widthParser = /width="(.+?)"/g;
const heightParser = /height="(.+?)"/g;
const strokeParser = /stroke="(.+?)"/g;
const fillParser = /fill="(.+?)"/g;
const strokeLinecapParser = /stroke-linecap="(.+?)"/g;
const strokeLinejoinParser = /stroke-linejoin="(.+?)"/g;
const strokeWidthParser = /stroke-width="(.+?)"/g;

const width = widthParser.exec(mapSvg)?.[1] || "250";
const height = heightParser.exec(mapSvg)?.[1] || "250";
const viewBox = viewBoxParser.exec(mapSvg)?.[1] || "0 0 250 250";
const stroke = strokeParser.exec(mapSvg)?.[1] || "#fff";
const fill = fillParser.exec(mapSvg)?.[1] || "#7c7c7c";
const strokeLinecap = strokeLinecapParser.exec(mapSvg)?.[1] || "round";
const strokeLinejoin = strokeLinejoinParser.exec(mapSvg)?.[1] || "round";
const strokeWidth = strokeWidthParser.exec(mapSvg)?.[1] || "0.01";

export const svgPaths = [...mapSvg.matchAll(attributesParser)].map(
  ([, path, a3, admin]) => ({ path, a3, admin }),
);

const topLeftCorner = latLng(-84.267, -180.5);
const bottomRightCorner = latLng(93, 172.1);
const maxBounds = latLngBounds(topLeftCorner, bottomRightCorner);

const bounds: LatLngBoundsExpression = maxBounds;

export function SvgMap({
  children,
  eventHandlers,
}: {
  eventHandlers?: LeafletEventHandlerFnMap;
  children: (zoom: number) => JSX.Element;
}) {
  const { map } = useMapContext();
  const [zoom, setZoom] = useState(1.5);

  useMapEvents({
    zoomend: () => {
      setZoom(map?.getZoom() || 1.5);
      console.log("zoom", map?.getZoom());
    },
  });

  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{
        xmlns: "http://www.w3.org/2000/svg",
        width,
        height,
        fill,
        stroke,
        strokeLinecap,
        strokeLinejoin,
        strokeWidth,
        viewBox,
      }}
      opacity={1}
      interactive
      zIndex={1000}
      eventHandlers={eventHandlers}
      className="transition-colors duration-500 ease-in-out"
    >
      {children(zoom)}
    </SVGOverlay>
  );
}
