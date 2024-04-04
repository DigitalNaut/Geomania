import { type ChangeEventHandler, useState } from "react";
import { animated } from "@react-spring/web";

import { ActionButton } from "src/components/common/ActionButton";
import { useFloatingPanelSlideInAnimation } from "src/components/activity/QuizFloatingPanel";
import { useMapActivityContext } from "src/contexts/MapActivityContext";
import { CountryWikiInfo } from "src/components/info/CountryWikiInfo";

export default function ReviewFloatingPanel({
  shouldShow,
  showNextCountry,
  disabled,
  onReset,
  onError,
}: {
  shouldShow: boolean;
  showNextCountry: () => void;
  disabled: boolean;
  onReset: () => void;
  onError: (error: Error) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const { firstTrail } = useFloatingPanelSlideInAnimation(shouldShow);
  const { isRandomReviewMode, setRandomReviewMode } = useMapActivityContext();

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => setRandomReviewMode(event.currentTarget.checked);

  return (
    <animated.div
      className="pointer-events-none absolute inset-x-0 bottom-8 z-[1000] mx-auto flex size-fit flex-col items-center gap-2 rounded-md"
      style={firstTrail}
    >
      {!disabled && (
        <details
          className="pointer-events-auto rounded-md bg-sky-900/70 p-3 shadow-md backdrop-blur-md hover:bg-sky-900"
          open={showDetails}
          onToggle={(event) => setShowDetails(event.currentTarget.open)}
        >
          <summary className="cursor-pointer">Wikipedia summary</summary>
          {shouldShow && showDetails && <CountryWikiInfo onError={onError} />}
        </details>
      )}
      <div className="pointer-events-auto flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <animated.div className="flex w-full flex-col items-center overflow-hidden rounded-md">
          <ActionButton
            className="w-full"
            disabled={disabled || !shouldShow}
            onClick={showNextCountry}
            title="Next country"
          >
            Next country
          </ActionButton>
          <div className="flex justify-between gap-2 p-1">
            <label className="flex items-center gap-2 p-1" htmlFor="randomMode">
              <input id="randomMode" type="checkbox" checked={isRandomReviewMode} onChange={onChange} />
              Random mode
            </label>
            <button
              className="flex h-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              role="button"
              title="Reset visited"
              onClick={onReset}
            >
              <span className="no-underline">Reset</span>
            </button>
          </div>
        </animated.div>
      </div>
    </animated.div>
  );
}
