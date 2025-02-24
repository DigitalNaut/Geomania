import type { LeafletEventHandlerFnMap, LeafletMouseEventHandlerFn } from "leaflet";
import { latLngBounds } from "leaflet";
import type { PropsWithChildren } from "react";
import { Fragment, useCallback, useMemo, useState } from "react";
import type { SVGOverlayProps } from "react-leaflet";
import { SVGOverlay } from "react-leaflet";
import { twMerge } from "tailwind-merge";

import { useMapContext } from "src/context/Map/hook";
import { useSvgAttributes } from "src/hooks/common/useSVGAttributes";

import mapSvg from "src/assets/images/generated/countries-world-map.svg?raw";

/**
 * Manual adjustments to the bounds of the map
 */
const manualBoundsAdjustment = {
  top: -1.35,
  left: 1.3,
  right: 53,
  bottom: 1,
} as const;

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
 * Lists of country categories for rendering
 */
type SvgMapLists = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style` ? `${Prefix}List` : never]: string[];
};

/**
 * Paths extracted from the SVG
 */
type SvgMapPaths = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style`
    ? `${Prefix}Paths`
    : never]: SVGPathElement[];
};

function WithAnimationDefs({ children }: PropsWithChildren) {
  return (
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
      {children}
    </>
  );
}

/**
 * Leaflet component to render an SVG map
 */
function SvgMap({
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

/**
 * SVG map implementation for countries
 * @param param0
 * @returns
 */
export function CountrySvgMap({
  hidden,
  colorTheme,
  onClick,
  className,
  lists: { activeList, highlightList, visitedList },
}: {
  hidden?: boolean;
  colorTheme: SvgMapColorTheme;
  onClick?: (a3: string) => void;
  className?: string;
  lists: Omit<SvgMapLists, "inactiveList">;
}) {
  const { zoom } = useMapContext();
  const { paths, width, height, viewBox } = useSvgAttributes(mapSvg, ["width", "height", "viewBox"]);

  const { visitedPaths, activePaths, highlightPaths, inactivePaths } = useMemo(
    () =>
      paths.reduce<SvgMapPaths>(
        (acc, path) => {
          if (highlightList.includes(path.id)) {
            acc.highlightPaths.push(path);
            return acc;
          }

          if (visitedList.includes(path.id)) {
            acc.visitedPaths.push(path);
            return acc;
          }

          if (activeList.includes(path.id)) {
            acc.activePaths.push(path);
            return acc;
          }

          acc.inactivePaths.push(path);
          return acc;
        },
        {
          highlightPaths: [],
          visitedPaths: [],
          activePaths: [],
          inactivePaths: [],
        },
      ),
    [activeList, highlightList, visitedList, paths],
  );

  const adjustForZoom = useCallback((value: number) => value / zoom ** 2, [zoom]);
  const strokeWidth = adjustForZoom(3);

  const click: LeafletMouseEventHandlerFn = ({ originalEvent }) => {
    const { target } = originalEvent;
    if (!(target instanceof Element)) return;

    const a3 = target.getAttribute("data-a3");

    if (a3) onClick?.(a3);
  };

  if (hidden) return null;

  return (
    <SvgMap
      className={className}
      svg={mapSvg}
      eventHandlers={{ click }}
      attributes={{ width, height, viewBox }}
      boundsAdjustment={manualBoundsAdjustment}
    >
      {inactivePaths.map((path, index) => (
        <path
          key={index}
          data-a3={path.id}
          d={path.getAttribute("d") ?? ""}
          className={colorTheme.country.inactiveStyle}
          style={{ strokeWidth }}
        />
      ))}

      {visitedPaths.map((path, index) => (
        <path
          key={index}
          data-a3={path.id}
          d={path.getAttribute("d") ?? ""}
          className={colorTheme.country.visitedStyle}
          style={{ strokeWidth }}
        />
      ))}

      {activePaths.map((path, index) => (
        <path
          key={index}
          data-a3={path.id}
          d={path.getAttribute("d") ?? ""}
          className={colorTheme.country.activeStyle}
          style={{ strokeWidth }}
        />
      ))}

      {highlightPaths.length > 0 && (
        <WithAnimationDefs>
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
        </WithAnimationDefs>
      )}
    </SvgMap>
  );
}
