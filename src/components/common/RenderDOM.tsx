import { createElement } from "react";

function filterText(text: string) {
  return `<div>${text
    .replace(/<(link|meta).+?>/g, "")
    .replace(/\\n/g, "")
    .replace(/\n/g, "")}</div>`;
}

export function RenderDOM({ input }: { input?: string }) {
  if (!input) return "";

  const filteredInput = filterText(input);
  const root = new DOMParser();
  const doc = root.parseFromString(filteredInput, "application/xhtml+xml");

  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    console.error(input);
    return null;
  }

  const htmlSections = doc?.childNodes[0].childNodes;

  if (!htmlSections) return null;

  return Object.values(htmlSections).map((node, key) =>
    node instanceof Element && node.tagName && node.textContent?.length
      ? createElement(node.tagName, { key, ...node.attributes }, <RenderDOM input={node.innerHTML} />)
      : node.textContent ?? "",
  );
}
