import type { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import { ActionButton } from "src/components/ActionButton";
import type { useMapVisitor } from "src/pages/MapVisitor.hooks";

function GuessHeaderSection({
  children,
  skipCountryHandler,
}: PropsWithChildren & {
  skipCountryHandler: () => void;
}) {
  return (
    <div className="flex gap-2 rounded-md bg-slate-800">
      <p className="p-2">{children}</p>
      <button
        className="flex items-center gap-1 p-2 underline"
        role="button"
        title="Skip country"
        onClick={skipCountryHandler}
      >
        <span>Skip</span>
        <FontAwesomeIcon icon={faForward} />
      </button>
    </div>
  );
}

function GuessInfoSection({
  giveHintHandler,
  userTries,
}: {
  giveHintHandler: () => void;
  userTries: number;
}) {
  return (
    <div
      className="flex w-full justify-between rounded-md p-2"
      // TODO: Revert
      // style={{ visibility: userTries > 0 ? "visible" : "hidden" }}
    >
      <span className="whitespace-nowrap">Guesses: {userTries}</span>

      <button
        className="flex items-center gap-1 underline"
        type="button"
        onClick={giveHintHandler}
      >
        <FontAwesomeIcon icon={faQuestionCircle} />
        <span>Hint!</span>
      </button>
    </div>
  );
}

export default function UserGuessFloatingPanel({
  visitor: {
    handleSkipCountry,
    inputRef,
    handleKeyDown,
    isReady,
    handleSubmitAnswer,
    userGuessTally,
    giveHint,
  },
}: {
  visitor: ReturnType<typeof useMapVisitor>;
}) {
  return (
    <div
      className="absolute inset-x-1/2 bottom-8 z-[1000] flex h-fit w-fit -translate-x-1/2 flex-col items-center gap-2 rounded-md text-center"
      style={{ visibility: isReady ? "visible" : "hidden" }}
    >
      <GuessHeaderSection skipCountryHandler={handleSkipCountry}>
        Which country is this?
      </GuessHeaderSection>

      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
        <div className="flex w-full justify-center overflow-hidden rounded-md">
          <input
            className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            placeholder="Enter country name"
            disabled={!isReady}
            maxLength={50}
          />
          <ActionButton fit disabled={!isReady} onClick={handleSubmitAnswer}>
            Submit
          </ActionButton>
        </div>

        <GuessInfoSection
          giveHintHandler={giveHint}
          userTries={userGuessTally}
        />
      </div>
    </div>
  );
}
