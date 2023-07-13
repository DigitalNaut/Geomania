import type { LatLngBoundsExpression, LeafletEventHandlerFnMap } from "leaflet";
import type { PropsWithChildren } from "react";

import { SVGOverlay } from "react-leaflet";

import mapSvg from "src/assets/images/world-map.svg?raw";

const viewBoxParser = /viewBox="(.+?)"/g;
const attributesParser = /<path d="(.+?)" A3="(.+?)" ADMIN="(.+?)"\/>/g;
const widthParser = /width="(.+?)"/g;
const heightParser = /height="(.+?)"/g;
const versionParser = /version="(.+?)"/g;
const strokeParser = /stroke="(.+?)"/g;
const fillParser = /fill="(.+?)"/g;
const strokeLinecapParser = /stroke-linecap="(.+?)"/g;
const strokeLinejoinParser = /stroke-linejoin="(.+?)"/g;
const strokeWidthParser = /stroke-width="(.+?)"/g;

const width = widthParser.exec(mapSvg)?.[1] || "512";
const height = heightParser.exec(mapSvg)?.[1] || "250";
const version = versionParser.exec(mapSvg)?.[1] || "1.2";
const viewBox = viewBoxParser.exec(mapSvg)?.[1] || "0 0 512 250";
const stroke = strokeParser.exec(mapSvg)?.[1] || "#fff";
const fill = fillParser.exec(mapSvg)?.[1] || "#7c7c7c";
const strokeLinecap = strokeLinecapParser.exec(mapSvg)?.[1] || "round";
const strokeLinejoin = strokeLinejoinParser.exec(mapSvg)?.[1] || "round";
const strokeWidth = strokeWidthParser.exec(mapSvg)?.[1] || "0.01";

export const svgPaths = [...mapSvg.matchAll(attributesParser)].map((match) => ({
  path: match[1],
  a3: match[2],
  admin: match[3],
}));

const bounds: LatLngBoundsExpression = [
  [-85.8, -180],
  [90, 180],
];

export function SvgMap({
  children,
  eventHandlers,
}: PropsWithChildren<{
  eventHandlers?: LeafletEventHandlerFnMap;
}>) {
  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{
        xmlns: "http://www.w3.org/2000/svg",
        baseprofile: "tiny",
        version,
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
    >
      {children}
    </SVGOverlay>
  );
}
