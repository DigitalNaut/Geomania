import type { LeafletEventHandlerFnMap } from "leaflet";
import { latLngBounds } from "leaflet";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import type { SVGOverlayProps } from "react-leaflet";
import { SVGOverlay } from "react-leaflet";
import { twMerge } from "tailwind-merge";

/**
 * Preset SVG attributes for the map
 */
const defaultSvgAttributes: SVGOverlayProps["attributes"] = {
  fill: "white",
  stroke: "white",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "0.01",
} as const;

export type SvgMapColorTheme = {
  country: {
    activeStyle: string;
    inactiveStyle: string;
    highlightStyle: string;
    visitedStyle: string;
  };
};

/**
 * Leaflet component to render an SVG map
 */
export default function SvgMap({
  className,
  children,
  eventHandlers,
  attributes,
  boundsAdjustment = { top: 0, bottom: 0, left: 0, right: 0 },
}: PropsWithChildren<{
  svg: string;
  className?: string;
  eventHandlers?: LeafletEventHandlerFnMap;
  attributes?: Record<string, string>;
  boundsAdjustment?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}>) {
  const [bounds] = useState(() => {
    const north = 85 + boundsAdjustment.top,
      south = -85 - boundsAdjustment.bottom,
      west = -180 - boundsAdjustment.left,
      east = 180 + boundsAdjustment.right;

    return latLngBounds([
      [south, west],
      [north, east],
    ]);
  });

  return (
    <SVGOverlay
      interactive
      bounds={bounds}
      attributes={{
        ...defaultSvgAttributes,
        ...attributes,
      }}
      zIndex={1000}
      className={twMerge("transition-colors duration-500 ease-in-out", className)}
      eventHandlers={eventHandlers}
    >
      {children}
    </SVGOverlay>
  );
}
