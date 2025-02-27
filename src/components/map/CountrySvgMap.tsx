import type { LeafletMouseEventHandlerFn } from "leaflet";
import type { PropsWithChildren, SVGAttributes } from "react";
import { Fragment, useCallback, useMemo } from "react";

import SvgMap from "src/components/common/SvgMap";
import { useMapContext } from "src/context/Map/hook";
import { useSvgAttributes } from "src/hooks/common/useSVGAttributes";

import mapSvg from "src/assets/images/generated/countries-world-map.svg?raw";

export type SvgMapColorTheme = {
  country: {
    activeStyle: string;
    inactiveStyle: string;
    highlightStyle: string;
    visitedStyle: string;
  };
};

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
 * Lists of country categories for rendering
 */
type SvgMapLists = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style` ? `${Prefix}List` : never]: string[];
};

export type ActiveSvgMapLists = Omit<SvgMapLists, "inactiveList">;

/**
 * Paths extracted from the SVG
 */
type SvgMapPaths = {
  [K in keyof SvgMapColorTheme["country"] as K extends `${infer Prefix}Style`
    ? `${Prefix}Paths`
    : never]: SVGPathElement[];
};

function WithWaveAnimationDefs({ children }: PropsWithChildren) {
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

function useCountrySvgMap(
  { activeList, highlightList, visitedList }: ActiveSvgMapLists,
  {
    onClick,
  }: {
    onClick?: (a3: string) => void;
  },
) {
  const attributes = useSvgAttributes(mapSvg, ["width", "height", "viewBox"]);

  const paths = useMemo(
    () =>
      attributes.paths.reduce<SvgMapPaths>(
        (acc, path) => {
          // Check if the country is active
          if (activeList.includes(path.id)) {
            // Check if the country is highlighted
            if (highlightList.includes(path.id)) {
              acc.highlightPaths.push(path);
              return acc;
            }

            // Check if the country was visited
            if (visitedList.includes(path.id)) {
              acc.visitedPaths.push(path);
              return acc;
            }

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
    [attributes.paths, activeList, highlightList, visitedList],
  );

  const click: LeafletMouseEventHandlerFn = ({ originalEvent }) => {
    const { target } = originalEvent;
    if (!(target instanceof Element)) return;

    const a3 = target.getAttribute("data-a3");

    if (a3) onClick?.(a3);
  };

  return { paths, attributes, eventHandlers: { click } };
}

function CountryPath({
  path,
  ...rest
}: {
  path: SVGPathElement;
} & Omit<SVGAttributes<SVGPathElement>, "path">) {
  const d = useMemo(() => path.getAttribute("d"), [path]);

  if (!d) return null;

  return <path data-a3={path.id} d={d} {...rest} />;
}

function useZoomAdjustedLineStroke() {
  const { zoom } = useMapContext();

  /**
   * Adjusts a value for the stroke width based on the map's zoom level.
   *
   * The value is divided by the square of the zoom level to narrow the stroke width as the map zooms in.
   * @param zoom
   * @returns
   */
  const scaleByZoom = useCallback((value: number) => value / zoom ** 2, [zoom]);

  return { scaleByZoom };
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
  lists,
}: {
  hidden?: boolean;
  colorTheme: SvgMapColorTheme;
  onClick?: (a3: string) => void;
  className?: string;
  lists: ActiveSvgMapLists;
}) {
  const {
    attributes: { width, height, viewBox },
    paths: { activePaths, highlightPaths, visitedPaths, inactivePaths },
    eventHandlers,
  } = useCountrySvgMap(lists, { onClick });

  const { scaleByZoom } = useZoomAdjustedLineStroke();

  const style = useMemo(() => {
    return { strokeWidth: scaleByZoom(3) };
  }, [scaleByZoom]);

  // Handle line drawing

  if (hidden) return null;

  return (
    <SvgMap
      className={className}
      svg={mapSvg}
      eventHandlers={eventHandlers}
      attributes={{ width, height, viewBox }}
      boundsAdjustment={manualBoundsAdjustment}
    >
      {inactivePaths.map((path, index) => (
        <CountryPath key={index} path={path} className={colorTheme.country.inactiveStyle} style={style} />
      ))}

      {visitedPaths.map((path, index) => (
        <CountryPath key={index} path={path} className={colorTheme.country.visitedStyle} style={style} />
      ))}

      {activePaths.map((path, index) => (
        <CountryPath key={index} path={path} className={colorTheme.country.activeStyle} style={style} />
      ))}

      {highlightPaths.length > 0 && (
        <WithWaveAnimationDefs>
          {highlightPaths.map((path) => (
            <Fragment key={path.id}>
              <CountryPath
                path={path}
                className={colorTheme.country.highlightStyle}
                style={{ strokeWidth: scaleByZoom(2) }}
              />

              <CountryPath
                path={path}
                pointerEvents="none"
                className="fill-[url(#land)] stroke-none hover:fill-lime-600/30"
              />

              <CountryPath
                path={path}
                pointerEvents="none"
                className="animate-scrollDash fill-lime-500 [stroke-dasharray:32] [stroke-dashoffset:8] hover:animate-none hover:fill-[url(#waves)] hover:stroke-white hover:[stroke-dasharray:0]"
                style={{
                  strokeWidth: scaleByZoom(4),
                }}
              />
            </Fragment>
          ))}
        </WithWaveAnimationDefs>
      )}
    </SvgMap>
  );
}
