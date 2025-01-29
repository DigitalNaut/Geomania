import type { SVGAttributes } from "react";
import { useMemo } from "react";

const parser = new DOMParser();

/**
 * Extracts the SVG attributes from the map SVG.
 * @returns Returns the paths, bounds, and set of attributes.
 */
export function useSvgAttributes<K extends keyof SVGAttributes<SVGElement>>(svg: string, attributes: K[]) {
  const doc = useMemo(() => parser.parseFromString(svg, "image/svg+xml"), [svg]);

  const errorNode = useMemo(() => doc.querySelector("parsererror"), [doc]);
  if (errorNode) throw new Error(`Invalid SVG: ${errorNode.textContent}`);

  // Parse the paths and bounds
  const paths = useMemo(() => Array.from(doc.querySelectorAll("path")), [doc]);

  // Extract the attributes from the SVG
  const extractedAttributes: Record<(typeof attributes)[number], string> = useMemo(() => {
    const record = Object.create(null);

    for (const attribute of attributes) {
      if (!doc.documentElement.hasAttribute(attribute)) continue;

      const value = doc.documentElement.getAttribute(attribute);
      if (value) record[attribute] = value;
    }

    return record;
  }, [attributes, doc.documentElement]);

  return { paths, ...extractedAttributes };
}
