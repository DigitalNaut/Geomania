import { Fragment, useCallback, useMemo } from "react";
import { SVGOverlay, type SVGOverlayProps } from "react-leaflet";
import { type LeafletMouseEventHandlerFn } from "leaflet";

import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import { useMapContext } from "src/contexts/MapContext";
import { useSvgAttributes } from "src/hooks/useSVGAttributes";
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

// Geounit presets
const svgAttributes: SVGOverlayProps["attributes"] = {
  fill: "white",
  stroke: "white",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "0.01",
};

const svgCorners: Parameters<typeof useSvgAttributes>[2] = {
  topLeftCorner: [-83.05, -180.6],
  bottomRightCorner: [83.09, 180.6],
};

export type SvgMapColorTheme = {
  country: {
    active: { fill: string; stroke: string };
    inactive: { fill: string; stroke: string };
  };
};

/**
 * Renders the map SVG as an overlay on the map.
 * @param props
 * @returns
 */
export default function SvgMap({
  selectedPaths,
  hidden,
  colorTheme,
  onClick,
}: {
  selectedPaths?: VisitedCountry[];
  hidden?: boolean;
  colorTheme: SvgMapColorTheme;
  onClick?: (a3: string) => void;
}) {
  const { zoom } = useMapContext();
  const { isCountryInData } = useCountryFiltersContext();

  const {
    paths: allPaths,
    bounds,
    width,
    height,
    viewBox,
  } = useSvgAttributes(mapSvg, ["width", "height", "viewBox"], svgCorners);

  const [styledPaths, otherPaths] = useMemo(() => {
    if (!allPaths) return [[], []];
    if (!selectedPaths) return [[], allPaths];

    const styledList: StyledPath[] = [];
    const otherList: SVGPathElement[] = [];

    const selectedPathsMap = new Map(selectedPaths.map((path) => [path.a3, path]));

    for (const path of allPaths) {
      const pathMatch = selectedPathsMap.get(path.id);

      if (pathMatch) styledList.push({ path, style: pathMatch?.style, highlight: pathMatch?.highlight });
      else otherList.push(path);
    }

    return [styledList, otherList];
  }, [selectedPaths, allPaths]);

  const click: LeafletMouseEventHandlerFn = ({ originalEvent }) => {
    const target = originalEvent.target as HTMLElement | null;
    const a3 = target?.getAttribute("data-a3"); // Set in the path elements below

    if (a3) onClick?.(a3);
  };

  const adjustForZoom = useCallback((value: number) => value / zoom ** 2, [zoom]);

  if (hidden) return null;

  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{
        ...svgAttributes,
        width,
        height,
        viewBox,
      }}
      opacity={1}
      interactive
      zIndex={1000}
      className="transition-colors duration-500 ease-in-out"
      eventHandlers={{ click }}
    >
      {otherPaths.map((path, index) => {
        const isActive = isCountryInData(path.id);
        return (
          <path
            key={index}
            data-a3={path.id}
            d={path.getAttribute("d") ?? ""}
            style={{
              stroke: isActive ? colorTheme.country.active.stroke : colorTheme.country.inactive.stroke,
              fill: isActive ? colorTheme.country.active.fill : colorTheme.country.inactive.fill,
              strokeWidth: adjustForZoom(3),
            }}
          />
        );
      })}

      {styledPaths?.length > 0 && (
        <>
          <defs>
            <linearGradient id="gradient" colorInterpolation="linearRGB">
              <stop offset="0%" stopColor="white" stopOpacity="0%" />
              <stop offset="95%" stopColor="white" stopOpacity="25%" />
              <stop offset="100%" stopColor="white" stopOpacity="0%" />
            </linearGradient>
            <rect id="line" width="4" height="32" fill="url(#gradient)" stroke="none" />
            <pattern id="waves" width="8" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45 50 50)">
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

            <circle width="9" height="9" r="1" stroke="none" className="fill-white/[6%]" />
            <pattern
              id="land"
              patternUnits="userSpaceOnUse"
              opacity="0.5"
              width="9"
              height="9"
              patternTransform="scale(0.25) rotate(45 3 3)"
            >
              <circle width="3" height="3" r="0.75" stroke="none" className="fill-white/[6%]" cx="2" cy="2" />
              <circle width="3" height="3" r="0.5" stroke="none" className="fill-white/[9%]" cx="5" cy="2" />
              <circle width="3" height="3" r="0.75" stroke="none" className="fill-white/[6%]" cx="8" cy="2" />
              <circle width="3" height="3" r="0.5" stroke="none" className="fill-white/[9%]" cx="2" cy="5" />
              <circle width="3" height="3" r="0.75.25" stroke="none" className="fill-white/[6%]" cx="5" cy="5" />
              <circle width="3" height="3" r="0.5" stroke="none" className="fill-white/[6%]" cx="8" cy="5" />
              <circle width="3" height="3" r="0.75" stroke="none" className="fill-white/[6%]" cx="2" cy="8" />
              <circle width="3" height="3" r="0.5" stroke="none" className="fill-white/[9%]" cx="5" cy="8" />
              <circle width="3" height="3" r="0.75" stroke="none" className="fill-white/[6%]" cx="8" cy="8" />
            </pattern>
          </defs>

          {styledPaths.map(({ path, style, highlight }) => {
            const { id } = path;
            const d = path.getAttribute("d");

            if (!d) return null;

            return (
              <Fragment key={id}>
                <path
                  data-a3={id}
                  d={d}
                  className={style}
                  style={{
                    strokeWidth: adjustForZoom(2),
                  }}
                />
                {highlight && (
                  <path
                    d={d}
                    data-a3={id}
                    pointerEvents="none"
                    className="animate-scrollDash fill-[url(#waves)] [stroke-dasharray:1] [stroke-dashoffset:_8]"
                    style={{
                      strokeWidth: adjustForZoom(4),
                    }}
                  />
                )}
                <path d={d} data-a3={id} pointerEvents="none" className="fill-[url(#land)] stroke-none" />
              </Fragment>
            );
          })}
        </>
      )}
    </SVGOverlay>
  );
}
