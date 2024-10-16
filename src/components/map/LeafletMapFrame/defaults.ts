import type { ComponentProps } from "react";
import type { MapContainer } from "react-leaflet";

import type { Required } from "src/types/utility";

export const mapDefaults: Required<
  ComponentProps<typeof MapContainer>,
  "center" | "zoom" | "minZoom" | "maxZoom" | "zoomControl" | "maxBoundsViscosity" | "style"
> = {
  center: [0, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 7,
  zoomControl: false,
  maxBoundsViscosity: 0.5,
  style: {
    backgroundColor: "transparent",
  },
} as const;
