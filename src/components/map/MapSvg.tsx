import { useMemo } from "react";
import { SVGOverlay } from "react-leaflet";
import { type LatLngBoundsExpression, latLng, latLngBounds } from "leaflet";

import { useMapContext } from "src/contexts/MapContext";
import mapSvg from "src/assets/images/world-map-mercator.svg?raw";

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

const svgPaths = [...mapSvg.matchAll(attributesParser)].map(([, path, a3, admin]) => ({ path, a3, admin }));

const topLeftCorner = latLng(-84.267, -180.5);
const bottomRightCorner = latLng(93, 172.1);
const maxBounds = latLngBounds(topLeftCorner, bottomRightCorner);

const bounds: LatLngBoundsExpression = maxBounds;

export function SvgMap({
  highlightAlpha3,
  onClick,
  enableOnClick,
}: {
  highlightAlpha3?: string;
  onClick: (alpha3: string) => void;
  enableOnClick: boolean;
}) {
  const { zoom } = useMapContext();

  const [highlightPath, otherPaths] = useMemo(() => {
    const index = svgPaths.findIndex((item) => item.a3 === highlightAlpha3);
    if (index === -1) return [undefined, svgPaths];

    const otherPaths = svgPaths.filter((_, i) => i !== index);
    return [svgPaths[index].path, otherPaths];
  }, [highlightAlpha3]);

  const onClickHandler = ({ originalEvent }: { originalEvent: MouseEvent }) => {
    const target = originalEvent.target as SVGPathElement | null;
    const alpha3 = target?.getAttribute("data-alpha3");
    if (alpha3) onClick(alpha3);
  };
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
      className="transition-colors duration-500 ease-in-out"
      eventHandlers={{
        click: enableOnClick ? onClickHandler : () => null,
      }}
    >
      {otherPaths.map((item, index) => (
        <path
          key={index}
          data-alpha3={item.a3}
          d={item.path}
          style={{
            stroke: "unset",
            fill: "#94a3b8",
            strokeWidth: 1 / zoom ** 2,
          }}
        />
      ))}
      {/* SVG path for the highlight country must be rendered last to be on top of the other countries */}
      {highlightPath && (
        <path
          data-alpha3={highlightAlpha3}
          d={highlightPath}
          style={{
            stroke: "#fcd34d",
            fill: "#fcd34d",
            strokeWidth: 2 / zoom ** 2,
          }}
        />
      )}
    </SVGOverlay>
  );
}
