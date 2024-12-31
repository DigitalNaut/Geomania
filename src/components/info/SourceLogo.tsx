import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const unsplashIconURL = "https://unsplash-assets.imgix.net/marketing/press-symbol.svg?auto=format&fit=crop&q=60";
const wikiLogoURL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/16px-Wikipedia-logo-v2.svg.png";

const sourceLogos = {
  unsplash: unsplashIconURL,
  wikipedia: wikiLogoURL,
} as const;

type Variant = keyof typeof sourceLogos;

export default function SourceLogo({ className, source }: { className?: string; source: Variant }) {
  const sourceName = useMemo(() => `${source.charAt(0).toUpperCase() + source.slice(1)} logo`, [source]);

  return (
    <img
      className={twMerge("w-4 inline-block", className)}
      src={sourceLogos[source]}
      alt={sourceName}
      title={sourceName}
      loading="lazy"
    />
  );
}
