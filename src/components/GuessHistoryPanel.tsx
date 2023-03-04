import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { UserCountryGuess } from "src/pages/MapVisitor.hooks";
import useScrollToTop from "src/hooks/useScrollToTop";

export default function GuessHistoryPanel({
  guessHistory,
}: {
  guessHistory: UserCountryGuess[];
}) {
  const {
    isScrolledToBottom,
    handleScrollEvent,
    handleScrollToTopClick,
    scrollElementRef,
  } = useScrollToTop();

  return (
    <div className="relative flex h-1/5 w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <h2 className="text-center text-xl italic text-slate-300">My Guesses</h2>
      <div
        className="flex flex-1 flex-col overflow-y-auto text-ellipsis px-2"
        onScroll={handleScrollEvent}
        ref={scrollElementRef}
      >
        <div className="flex flex-col pb-12">
          {guessHistory.length ? (
            guessHistory.map(
              (guess) =>
                guess && (
                  <span
                    className={`flex items-center gap-2 text-clip ${
                      guess.isCorrect ? "text-green-500" : "text-slate-300"
                    }`}
                    key={guess.timestamp}
                    title={guess.text}
                  >
                    <FontAwesomeIcon
                      icon={guess.isCorrect ? faCheck : faTimes}
                    />
                    {guess.text}
                  </span>
                )
            )
          ) : (
            <div className="pt-2 text-center text-sm italic">
              None yet, start guessing!
            </div>
          )}
        </div>
        {!isScrolledToBottom && (
          <div className="absolute inset-x-0 bottom-0 h-fit bg-gradient-to-t from-slate-900 px-6 pb-4 pt-12">
            <button
              className="w-full rounded-md bg-white/80 text-center text-slate-900"
              role="button"
              onClick={() => handleScrollToTopClick(scrollElementRef)}
            >
              Scroll to top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
