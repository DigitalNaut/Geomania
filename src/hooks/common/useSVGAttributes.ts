import type { SVGAttributes } from "react";
import { useMemo } from "react";

const parser = new DOMParser();

/**
 * Extracts the SVG attributes from the map SVG.
 * @returns Returns the paths, bounds, and set of attributes.
 */
export function useSvgAttributes<K extends keyof SVGAttributes<SVGElement>, R = Record<K, string>>(
  svg: string,
  attributes: K[],
) {
  const doc = useMemo(() => parser.parseFromString(svg, "image/svg+xml"), [svg]);

  const errorNode = useMemo(() => doc.querySelector("parsererror"), [doc]);
  if (errorNode) throw new Error(`Invalid SVG: ${errorNode.textContent}`);

  // Parse the paths and bounds
  const paths = useMemo(() => Array.from(doc.querySelectorAll("path")), [doc]);

  // Extract the attributes from the SVG
  const extractedAttributes: R = useMemo(() => {
    const record = attributes.reduce<R>(
      (acc, attribute) => ({ ...acc, [attribute]: doc.documentElement.getAttribute(attribute) }),
      {} as R,
    );

    return record;
  }, [attributes, doc.documentElement]);

  return { paths, ...extractedAttributes, attributes: doc.documentElement.attributes };
}
