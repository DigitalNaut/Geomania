import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

import useScrollTo from "src/hooks/useScrollTo";
import type { CountryGuess } from "src/hooks/useUserGuessRecord/types";
import { useMemo } from "react";

export default function GuessHistoryPanel({ guessHistory }: { guessHistory: CountryGuess[] }) {
  const { isScrolledToPosition, scrollToPosition, scrollRef } = useScrollTo("bottom");

  const [guessList, latestGuess] = useMemo(() => {
    if (!guessHistory.length) return [];

    const last = guessHistory.pop();
    const entries = guessHistory.slice(0, -1);

    return [entries, last];
  }, [guessHistory]);

  return (
    <div className="relative flex flex-col gap-2 overflow-y-auto">
      <h3 className="text-center text-slate-300">Last {guessHistory.length} guesses</h3>
      <div className="flex flex-1 flex-col overflow-y-auto text-ellipsis px-2" ref={scrollRef}>
        <div className="flex flex-col-reverse pb-12">
          {guessList?.length &&
            guessList.map((guess) => {
              return (
                <motion.div
                  className={twMerge(
                    "flex items-center gap-2 px-1",
                    guess.isCorrect ? "text-green-500" : "text-slate-200",
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={guess.timestamp}
                  title={guess.text}
                >
                  <FontAwesomeIcon icon={guess.isCorrect ? faCheck : faTimes} />
                  {guess.text}
                </motion.div>
              );
            })}
          {latestGuess && (
            <motion.div
              className={twMerge(
                "flex items-center gap-2 px-1 py-2 text-white rounded-sm",
                latestGuess.isCorrect ? "bg-green-800" : "bg-yellow-800",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={latestGuess.timestamp}
              title={latestGuess.text}
            >
              <FontAwesomeIcon icon={latestGuess.isCorrect ? faCheck : faTimes} />
              {latestGuess.text}
            </motion.div>
          )}
          {!guessHistory.length && <div className="pt-2 text-center text-sm italic">None yet, start guessing!</div>}
        </div>
        {!isScrolledToPosition && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-fit bg-gradient-to-t from-slate-900 px-6 pb-4 pt-12">
            <button
              className="pointer-events-auto w-full rounded-md bg-white/80 text-center text-slate-900"
              role="button"
              onClick={scrollToPosition}
            >
              Scroll to top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
