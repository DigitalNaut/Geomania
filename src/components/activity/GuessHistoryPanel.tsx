import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSpring, animated } from "@react-spring/web";
import { twMerge } from "tailwind-merge";

import type { CountryGuess } from "src/hooks/useUserGuessRecord/types";
import useScrollToTop from "src/hooks/useScrollToTop";

let itemStyle: string;

const props = {
  from: { opacity: 0 },
  to: { opacity: 1 },
  config: { duration: 200 },
};

export default function GuessHistoryPanel({ guessHistory }: { guessHistory: CountryGuess[] }) {
  const { isScrolledToBottom, handleScrollEvent, scrollToTop, scrollElementRef } = useScrollToTop();
  const [rendered, setRendered] = useState(false);
  const [springs, api] = useSpring(() => ({}));

  useEffect(() => {
    if (rendered) api.start(props);
    else setRendered(true);
  }, [api, guessHistory, rendered]);

  return (
    <div className="relative flex flex-col gap-2 overflow-y-auto">
      <h3 className="text-center text-slate-300">Last {guessHistory.length} guesses</h3>
      <div
        className="flex flex-1 flex-col overflow-y-auto text-ellipsis px-2"
        onScroll={handleScrollEvent}
        ref={scrollElementRef}
      >
        <div className="flex flex-col-reverse pb-12">
          {guessHistory.length ? (
            guessHistory.map((guess, index) => {
              const isLastItem = index === guessHistory.length - 1;

              if (isLastItem) {
                itemStyle = `py-2 text-white ${guess.isCorrect ? "bg-green-800" : "bg-yellow-800"}`;
              } else {
                itemStyle = guess.isCorrect ? " text-green-500 " : " text-slate-200 ";
              }

              return (
                <animated.div
                  className={twMerge("flex items-center gap-2 px-1", itemStyle)}
                  style={isLastItem ? springs : {}}
                  key={guess.timestamp}
                  title={guess.text}
                >
                  <FontAwesomeIcon icon={guess.isCorrect ? faCheck : faTimes} />
                  {guess.text}
                </animated.div>
              );
            })
          ) : (
            <div className="pt-2 text-center text-sm italic">None yet, start guessing!</div>
          )}
        </div>
        {!isScrolledToBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-fit bg-gradient-to-t from-slate-900 px-6 pb-4 pt-12">
            <button
              className="pointer-events-auto w-full rounded-md bg-white/80 text-center text-slate-900"
              role="button"
              onClick={() => scrollToTop(scrollElementRef)}
            >
              Scroll to top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
