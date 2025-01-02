import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { ChangeEventHandler, JSX, PropsWithChildren } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { ActionButton } from "src/components/common/ActionButton";
import { CountryWikiInfo } from "src/components/info/CountryWikiInfo";
import SourceLogo from "src/components/info/SourceLogo";
import { UnsplashImages } from "src/components/info/UnsplashImages";
import { useMapActivity } from "src/hooks/useMapActivity";
import { InlineButton } from "./InlineButton";

const AnimationVariants: Variants = {
  hidden: (custom: number = 0) => ({ opacity: 0, translateY: custom, transition: { duration: 0.1 } }),
  visible: { opacity: 1, translateY: 0, transition: { duration: 0.2 } },
};

function DetailFloatingPanel({
  children,
  summary,
  className,
}: PropsWithChildren<{ className?: string; summary: JSX.Element }>) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      className={twMerge("absolute top-16 z-[1000] rounded-md", className)}
      variants={AnimationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <details
        className="rounded-md bg-sky-900/70 p-3 pr-0 shadow-md backdrop-blur-md hover:bg-sky-900"
        open={showDetails}
        onToggle={(event) => setShowDetails(event.currentTarget.open)}
      >
        <summary className="mr-4 cursor-pointer truncate">{summary}</summary>
        {showDetails && children}
      </details>
    </motion.div>
  );
}

export function WikipediaFloatingPanel({ onError }: { onError: (error: Error) => void }) {
  return (
    <DetailFloatingPanel
      summary={
        <>
          &ensp;
          <SourceLogo source="wikipedia" />
          &nbsp;Wikipedia summary
        </>
      }
      className="left-4"
    >
      <CountryWikiInfo onError={onError} />
    </DetailFloatingPanel>
  );
}

export function UnsplashImagesFloatingPanel({ onError }: { onError: (error: Error) => void }) {
  return (
    <DetailFloatingPanel
      summary={
        <>
          &ensp;
          <SourceLogo source="unsplash" />
          &nbsp;Unsplash images
        </>
      }
      className="right-16"
    >
      <UnsplashImages onError={onError} />
    </DetailFloatingPanel>
  );
}

export default function ReviewFloatingPanel({
  showNextCountry,
  disabled,
  onReset,
}: {
  showNextCountry: () => void;
  disabled: boolean;
  onReset: () => void;
}) {
  const { isRandomReviewMode, setRandomReviewMode } = useMapActivity();

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) =>
    setRandomReviewMode(Boolean(event.currentTarget.checked));

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-[1000] mx-auto flex size-fit flex-col items-center gap-2 rounded-md"
      variants={AnimationVariants}
      custom={100}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="pointer-events-auto flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <motion.div className="flex w-full flex-col items-center overflow-hidden rounded-md">
          <ActionButton className="w-full" disabled={disabled} onClick={showNextCountry} title="Next country">
            Next country
          </ActionButton>
          <div className="flex justify-between gap-2 p-1">
            <label className="flex items-center gap-2 p-1" htmlFor="randomMode">
              <input id="randomMode" type="checkbox" checked={isRandomReviewMode} onChange={onChange} />
              Random mode
            </label>
            <InlineButton onClick={onReset}>Reset</InlineButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
