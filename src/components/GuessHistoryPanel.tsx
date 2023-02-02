import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { HistoryGuess } from "src/pages/MapVisitor.hooks";
import useScrollToBottom from "src/hooks/useScrollToBottom";

export default function GuessHistoryPanel({
  history,
}: {
  history: HistoryGuess[];
}) {
  const {
    isScrolledToBottom,
    handleScrollEvent,
    handleScrollToBottomClick,
    scrollElementRef,
  } = useScrollToBottom();

  return (
    <div className="relative flex w-[30ch] flex-col bg-slate-800">
      <h2 className="text-center text-xl italic text-slate-300">My Guesses</h2>
      <div
        className="flex flex-1 flex-col-reverse overflow-y-auto overflow-x-clip text-ellipsis px-2"
        onScroll={handleScrollEvent}
        ref={scrollElementRef}
      >
        <div className="flex flex-col-reverse">
          {history.map(
            (guess) =>
              guess && (
                <span
                  className={`flex items-center gap-2 text-clip ${
                    guess.isCorrect ? "text-green-500" : "text-slate-300"
                  }`}
                  key={guess.timestamp}
                  title={guess.text}
                >
                  <FontAwesomeIcon icon={guess.isCorrect ? faCheck : faTimes} />
                  {guess.text}
                </span>
              )
          )}
        </div>
        {!isScrolledToBottom && (
          <div className="absolute inset-x-0 h-fit bg-gradient-to-t from-slate-900 px-6 pb-4 pt-12 text-white">
            <button
              className="w-full rounded-md bg-white/80 text-center text-slate-900"
              role="button"
              onClick={() => handleScrollToBottomClick(scrollElementRef)}
            >
              Scroll to bottom
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
