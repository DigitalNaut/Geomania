import type { LeafletMouseEventHandlerFn } from "leaflet";
import { latLngBounds } from "leaflet";
import { Fragment, useCallback, useMemo, useState } from "react";
import type { SVGOverlayProps } from "react-leaflet";
import { SVGOverlay } from "react-leaflet";
import { twMerge } from "tailwind-merge";

import mapSvg from "src/assets/images/generated/world-map-countries.svg?raw";
import { useSvgAttributes } from "src/hooks/common/useSVGAttributes";
import { useMapContext } from "src/context/Map/hook";

const mapBoundsAdjustment = {
  top: -1.35,
  left: 1.3,
  right: 53,
  bottom: 1,
};

// Geounit presets
const svgAttributes: SVGOverlayProps["attributes"] = {
  fill: "white",
  stroke: "white",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "0.01",
};

export type SvgMapColorTheme = {
  country: {
    activeStyle: string;
    inactiveStyle: string;
    highlightStyle: string;
    visitedStyle: string;
  };
};

type SvgMapLists = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style` ? `${Prefix}List` : never]: string[];
};

type SvgMapPaths = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style`
    ? `${Prefix}Paths`
    : never]: SVGPathElement[];
};

/**
 * Renders the map SVG as an overlay on the map.
 * @param props
 * @returns
 */
export default function SvgMap({
  hidden,
  colorTheme,
  onClick,
  className,
  lists: { activeList, highlightList, inactiveList, visitedList },
}: {
  hidden?: boolean;
  colorTheme: SvgMapColorTheme;
  onClick?: (a3: string) => void;
  className?: string;
  lists: SvgMapLists;
}) {
  const { zoom } = useMapContext();

  const { paths, width, height, viewBox } = useSvgAttributes(mapSvg, ["width", "height", "viewBox"]);

  const [bounds] = useState(() => {
    const north = 85 + mapBoundsAdjustment.top,
      south = -85 - mapBoundsAdjustment.bottom,
      west = -180 - mapBoundsAdjustment.left,
      east = 180 + mapBoundsAdjustment.right;

    // const [west, south, east, north] = [-20037508.342789244, -19971868.88040857, 20037508.342789244, 18394384.316255685];

    return latLngBounds([
      [south, west],
      [north, east],
    ]);
  });

  const click: LeafletMouseEventHandlerFn = ({ originalEvent }) => {
    const target = originalEvent.target as HTMLElement | null;
    const a3 = target?.getAttribute("data-a3"); // Set in the path elements below

    if (a3) onClick?.(a3);
  };

  const adjustForZoom = useCallback((value: number) => value / zoom ** 2, [zoom]);

  const { visitedPaths, activePaths, highlightPaths } = useMemo(
    () =>
      paths.reduce<SvgMapPaths>(
        (acc, path) => {
          if (visitedList.includes(path.id)) acc.visitedPaths.push(path);
          if (activeList.includes(path.id)) acc.activePaths.push(path);
          if (inactiveList.includes(path.id)) acc.inactivePaths.push(path);
          if (highlightList.includes(path.id)) acc.highlightPaths.push(path);

          return acc;
        },
        {
          visitedPaths: [],
          activePaths: [],
          inactivePaths: [],
          highlightPaths: [],
        },
      ),
    [activeList, highlightList, inactiveList, visitedList, paths],
  );

  if (hidden) return null;

  const strokeWidth = adjustForZoom(3);

  return (
    <SVGOverlay
      interactive
      bounds={bounds}
      attributes={{
        ...svgAttributes,
        width,
        height,
        viewBox,
      }}
      zIndex={1000}
      className={twMerge("transition-colors duration-500 ease-in-out", className)}
      eventHandlers={{ click }}
    >
      {paths.map((path, index) => {
        return (
          <path
            key={index}
            data-a3={path.id}
            d={path.getAttribute("d") ?? ""}
            className={colorTheme.country.inactiveStyle}
            style={{ strokeWidth }}
          />
        );
      })}

      {activePaths.map((path, index) => {
        return (
          <path
            key={index}
            data-a3={path.id}
            d={path.getAttribute("d") ?? ""}
            className={colorTheme.country.activeStyle}
            style={{ strokeWidth }}
          />
        );
      })}

      {visitedPaths.map((path, index) => {
        return (
          <path
            key={index}
            data-a3={path.id}
            d={path.getAttribute("d") ?? ""}
            className={colorTheme.country.visitedStyle}
            style={{ strokeWidth }}
          />
        );
      })}

      {highlightPaths?.length > 0 && (
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
              <ellipse rx="0.55" ry="0.25" cx="2" cy="2" stroke="none" className="fill-white/[6%]" />
              <ellipse rx="0.25" ry="0.55" cx="5" cy="2" stroke="none" className="fill-white/[9%]" />
              <ellipse rx="0.55" ry="0.25" cx="8" cy="2" stroke="none" className="fill-white/[6%]" />
              <ellipse rx="0.25" ry="0.55" cx="2" cy="5" stroke="none" className="fill-white/[9%]" />
              <ellipse rx="0.55" ry="0.25" cx="5" cy="5" stroke="none" className="fill-white/[6%]" />
              <ellipse rx="0.25" ry="0.55" cx="8" cy="5" stroke="none" className="fill-white/[9%]" />
              <ellipse rx="0.55" ry="0.25" cx="2" cy="8" stroke="none" className="fill-white/[6%]" />
              <ellipse rx="0.25" ry="0.55" cx="5" cy="8" stroke="none" className="fill-white/[9%]" />
              <ellipse rx="0.55" ry="0.25" cx="8" cy="8" stroke="none" className="fill-white/[6%]" />
            </pattern>
          </defs>

          {highlightPaths.map((path) => {
            const { id } = path;
            const d = path.getAttribute("d");

            if (!d) return null;

            return (
              <Fragment key={id}>
                <path
                  data-a3={id}
                  d={d}
                  className={colorTheme.country.highlightStyle}
                  style={{ strokeWidth: adjustForZoom(2) }}
                />
                <path
                  d={d}
                  data-a3={id}
                  pointerEvents="none"
                  className="fill-[url(#land)] stroke-none hover:fill-lime-600/30"
                />
                <path
                  d={d}
                  data-a3={id}
                  pointerEvents="none"
                  className="animate-scrollDash fill-lime-500 [stroke-dasharray:32] [stroke-dashoffset:8] hover:[animation:none] hover:fill-[url(#waves)] hover:stroke-white hover:[stroke-dasharray:0]"
                  style={{
                    strokeWidth: adjustForZoom(4),
                  }}
                />
              </Fragment>
            );
          })}
        </>
      )}
    </SVGOverlay>
  );
}
