import { createElement, useMemo } from "react";

function filterText(text: string) {
  const replacedText = text
    .replace(/<(link|meta).+?>/g, "")
    .replace(/\\n/g, "")
    .replace(/\n/g, "");
  return `<div>${replacedText}</div>`;
}

const domParser = new DOMParser();

export function RenderDOM({ input }: { input: string }) {
  const doc = useMemo(() => {
    const filteredInput = filterText(input);
    return domParser.parseFromString(filteredInput, "application/xhtml+xml");
  }, [input]);

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
      : (node.textContent ?? ""),
  );
}
