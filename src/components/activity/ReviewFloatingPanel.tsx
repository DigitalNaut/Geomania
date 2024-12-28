import type { Variants } from "motion/react";
import { motion } from "motion/react";
import type { ChangeEventHandler } from "react";
import { useState } from "react";

import { ActionButton } from "src/components/common/ActionButton";
import { CountryWikiInfo } from "src/components/info/CountryWikiInfo";
import { UnsplashImages } from "src/components/info/UnsplashImages";
import { useMapActivity } from "src/hooks/useMapActivity";
import { InlineButton } from "./InlineButton";

const wikiPanelVariants: Variants = {
  hidden: { opacity: 0, translateY: -100, transition: { duration: 0.1 } },
  visible: { opacity: 1, translateY: 0, transition: { duration: 0.2 } },
};

export function WikipediaFloatingPanel({ onError }: { onError: (error: Error) => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      className="absolute left-4 top-16 z-[1000] rounded-md"
      key="wikipedia-floating-panel"
      variants={wikiPanelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <details
        className="rounded-md bg-sky-900/70 p-3 pr-0 shadow-md backdrop-blur-md hover:bg-sky-900"
        open={showDetails}
        onToggle={(event) => setShowDetails(event.currentTarget.open)}
      >
        <summary className="cursor-pointer pr-3">Wikipedia summary</summary>
        {showDetails && <CountryWikiInfo onError={onError} />}
      </details>
    </motion.div>
  );
}

const unsplashPanelVariants: Variants = {
  hidden: { opacity: 0, translateY: -100, transition: { duration: 0.1 } },
  visible: { opacity: 1, translateY: 0, transition: { duration: 0.2 } },
};

export function UnsplashImagesFloatingPanel({ onError }: { onError: (error: Error) => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      className="absolute right-16 top-16 z-[1000] rounded-md"
      key="unsplash-floating-panel"
      variants={unsplashPanelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <details
        className="rounded-md bg-sky-900/70 p-3 pr-0 shadow-md backdrop-blur-md hover:bg-sky-900"
        open={showDetails}
        onToggle={(event) => setShowDetails(event.currentTarget.open)}
      >
        <summary className="cursor-pointer pr-3">Unsplash images</summary>
        {showDetails && <UnsplashImages onError={onError} />}
      </details>
    </motion.div>
  );
}

const reviewPanelVariants: Variants = {
  hidden: { opacity: 0, translateY: 100, transition: { duration: 0.1 } },
  visible: { opacity: 1, translateY: 0, transition: { duration: 0.2 } },
};

export default function ReviewFloatingPanel({
  showNextCountry,
  disabled,
  onReset,
}: {
  showNextCountry: () => void;
  disabled: boolean;
  onReset: () => void;
}) {
  const { isRandomReviewMode, toggleRandomReviewMode } = useMapActivity();

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => toggleRandomReviewMode(event.currentTarget.checked);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-[1000] mx-auto flex size-fit flex-col items-center gap-2 rounded-md"
      key="review-floating-panel"
      variants={reviewPanelVariants}
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
