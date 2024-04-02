import { Fragment, useMemo } from "react";
import { SVGOverlay } from "react-leaflet";
import { type LeafletMouseEventHandlerFn } from "leaflet";

import { useMapContext } from "src/contexts/MapContext";
import { useSvgAttributes } from "src/hooks/useSVGAttributes";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import mapSvg from "src/assets/images/world-map-mercator.svg?raw";

type PathProperties = {
  style: string;
  highlight?: boolean;
};

type StyledPath = {
  path: SVGPathElement;
} & PathProperties;

export type VisitedCountry = {
  a3: string;
} & PathProperties;

// TODO: Refactor
// Style presets for the map
// Geounit presets
const lighterBlueGray = "#94a3b8";
const darkerBlueGray = "#64748b";
const halfOpaque = 0.5;
const seeThrough = 0.15;

/**
 * Renders the map SVG as an overlay on the map.
 * @param props
 * @returns
 */
export default function SvgMap({
  selectedPaths,
  onClick,
  disableColorFilter,
  hidden,
}: {
  selectedPaths?: VisitedCountry[];
  onClick?: (a3: string) => void;
  disableColorFilter: boolean;
  hidden?: boolean;
}) {
  const { zoom } = useMapContext();
  const { isCountryInFilters } = useCountryFiltersContext();

  const { paths, bounds, width, height, viewBox } = useSvgAttributes(mapSvg, ["width", "height", "viewBox"], {
    topLeftCorner: [-83.05, -180.6],
    bottomRightCorner: [83.09, 180.6],
  });

  const [styledPaths, otherPaths] = useMemo(() => {
    if (!paths) return [[], []];
    if (!selectedPaths) return [[], paths];

    const styledList: StyledPath[] = [];
    const otherList: SVGPathElement[] = [];

    for (const path of paths) {
      const pathMatch = selectedPaths.find((item) => item.a3 === path.id);

      if (pathMatch) styledList.push({ path, style: pathMatch?.style, highlight: pathMatch?.highlight });
      else otherList.push(path);
    }

    return [styledList, otherList];
  }, [selectedPaths, paths]);

  const click: LeafletMouseEventHandlerFn = ({ originalEvent }) => {
    const target = originalEvent.target as HTMLElement | null;
    const a3 = target?.getAttribute("data-a3"); // data-a3 is set in the SVGOverlay below

    if (a3) onClick?.(a3);
  };

  const adjustForZoom = (value: number) => value / zoom ** 2;

  if (hidden) return null;

  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{
        width,
        height,
        fill: "white",
        stroke: "white",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "0.01",
        viewBox,
      }}
      opacity={1}
      interactive
      zIndex={1000}
      className="transition-colors duration-500 ease-in-out"
      eventHandlers={{ click }}
    >
      {otherPaths.map((path, index) => {
        const colorFilter = disableColorFilter || isCountryInFilters(path.id);

        return (
          <path
            key={index}
            data-a3={path.id}
            d={path.getAttribute("d") ?? ""}
            style={{
              strokeOpacity: colorFilter ? halfOpaque : seeThrough,
              fill: colorFilter ? lighterBlueGray : darkerBlueGray,
              strokeWidth: adjustForZoom(3),
            }}
          />
        );
      })}

      {styledPaths?.length > 0 && (
        <>
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="white" stopOpacity="0%" />
              <stop offset="50%" stopColor="white" stopOpacity="100%" />
              <stop offset="100%" stopColor="white" stopOpacity="0%" />
            </linearGradient>
            <rect id="line" width="4" height="32" fill="url(#gradient)" stroke="none" />
            <pattern
              id="pattern"
              width="8"
              height="32"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45 50 50)"
            >
              <rect id="bg" className="fill-none stroke-none" x="0" y="0" width="8" height="32" />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="1"
                  to="9"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <use xlinkHref="#line" />
                <use xlinkHref="#line" x="-8" />
              </g>
            </pattern>
          </defs>

          {styledPaths.map(({ path, style, highlight }) => (
            <Fragment key={path.id}>
              <path
                data-a3={path.id}
                d={path.getAttribute("d") ?? ""}
                className={style}
                style={{
                  strokeWidth: adjustForZoom(2),
                }}
              />
              {highlight && (
                <path
                  d={path.getAttribute("d") ?? ""}
                  className="pointer-events-none animate-scrollDash border-none fill-[url(#pattern)] stroke-none [stroke-dashoffset:_16]"
                />
              )}
            </Fragment>
          ))}
        </>
      )}
    </SVGOverlay>
  );
}
