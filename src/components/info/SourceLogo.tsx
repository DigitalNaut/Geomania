import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const logoUrls = {
  unsplash: "https://unsplash-assets.imgix.net/marketing/press-symbol.svg?auto=format&fit=crop&q=60",
  wikipedia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/16px-Wikipedia-logo-v2.svg.png",
} as const;

export default function SourceLogo({ className, source }: { className?: string; source: keyof typeof logoUrls }) {
  const alt = useMemo(() => `${source.charAt(0).toUpperCase() + source.slice(1)} logo`, [source]);
  const src = useMemo(() => logoUrls[source], [source]);

  return <img className={twMerge("w-4 inline-block", className)} src={src} alt={alt} loading="lazy" />;
}
