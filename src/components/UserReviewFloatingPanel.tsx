import { animated } from "@react-spring/web";

import type { useCountryReview } from "src/controllers/useCountryReview";
import { ActionButton } from "src/components/ActionButton";
import { useFloatingPanelSlideInAnimation } from "src/components/UserGuessFloatingPanel";

export default function UserReviewFloatingPanel({
  shouldShow,
  visitor: { showNextCountry },
}: {
  shouldShow: boolean;
  visitor: Pick<ReturnType<typeof useCountryReview>, "showNextCountry">;
}) {
  const { firstTrail } = useFloatingPanelSlideInAnimation(shouldShow);

  return (
    <animated.div
      className="absolute inset-x-0 bottom-8 z-[1000] mx-auto flex h-fit w-fit flex-col items-center gap-2 rounded-md text-center"
      style={firstTrail}
    >
      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <div className="rounded-md bg-red-500">
          <animated.div className="flex w-full justify-center overflow-hidden rounded-md">
            <ActionButton disabled={!shouldShow} onClick={showNextCountry}>
              Next country
            </ActionButton>
          </animated.div>
        </div>
      </div>
    </animated.div>
  );
}
