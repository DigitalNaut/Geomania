import { useMemo, useRef } from "react";
import { animated, useSpring } from "@react-spring/web";

import { faBroom } from "@fortawesome/free-solid-svg-icons";

import type { CountryStats } from "src/contexts/GuessRecordContext";

import MainView from "src/components/MainView";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import { Link } from "react-router-dom";
import ThinkingFace from "src/assets/images/mascot-thinking-bw.min.svg";
import { Button } from "src/components/Button";

type CountryProgressProps = {
  correct: number;
  incorrect: number;
};

function CountryProgress({ correct, incorrect }: CountryProgressProps) {
  const [adjustedCorrect, adjustedIncorrect, padEnd] = useMemo(() => {
    const total = correct + incorrect;
    if (total < 10) return [correct, incorrect, 10 - total];

    const adjustedTotal = 10;
    const adjustedCorrect = Math.round((correct / total) * adjustedTotal);
    const adjustedIncorrect = adjustedTotal - adjustedCorrect;

    return [adjustedCorrect, adjustedIncorrect, 0];
  }, [correct, incorrect]);

  return (
    <div>
      <span className="text-green-600">{"●".repeat(adjustedCorrect)}</span>
      <span className="text-yellow-600">{"●".repeat(adjustedIncorrect)}</span>
      <span className="text-gray-600">{"●".repeat(padEnd)}</span>
    </div>
  );
}

type CountryStatsProps = {
  countryStats: CountryStats;
};

function CountryStatsCard({ countryStats }: CountryStatsProps) {
  return (
    <div
      className="flex gap-2 rounded-md p-4 hover:bg-white/10"
      title={`${countryStats.name}\nCorrect: ${countryStats.correctGuesses}\nIncorrect: ${countryStats.incorrectGuesses}`}
    >
      <img
        className="before:bg-custom-unknown-flag h-[2.4rem] w-16 p-1 before:block before:h-[2.4rem] before:w-16"
        src={`https://flagcdn.com/${countryStats.alpha2.toLocaleLowerCase()}.svg`}
        alt={countryStats.alpha3}
        loading="lazy"
        width={64}
        height={38.4}
      />
      <div>
        <div className="line-clamp-2 w-32 text-ellipsis text-sm">
          {countryStats.name}
        </div>
        <CountryProgress
          correct={countryStats.correctGuesses}
          incorrect={countryStats.incorrectGuesses}
        />
      </div>
    </div>
  );
}

function useAnimatedDialog(ref: React.RefObject<HTMLDialogElement>) {
  const [dialogSprings, dialogSpringsApi] = useSpring(() => ({
    from: { opacity: 0, transform: "translateY(-1rem)" },
    to: { opacity: 1, transform: "translateY(0)" },
  }));

  const showDialog = () => {
    ref.current?.showModal();
    dialogSpringsApi.start({
      from: { opacity: 0, transform: "translateY(-1rem)" },
      to: { opacity: 1, transform: "translateY(0)" },
    });
  };

  return {
    dialogSprings,
    showDialog,
  };
}

function useDashboard() {
  const { countryStats, clearProgress } = useUserGuessRecordContext();

  const countryStatsList: CountryStats[] | undefined = useMemo(() => {
    const countryValues = Object.values(countryStats);

    return countryValues.sort((a, b) => a.name.localeCompare(b.name));
  }, [countryStats]);

  return {
    countryStatsList,
    clearProgress,
  };
}

export default function Dashboard() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { countryStatsList, clearProgress } = useDashboard();
  const { dialogSprings, showDialog } = useAnimatedDialog(dialogRef);

  return (
    <MainView className="sm:flex-col">
      <animated.dialog
        className="max-w-[50ch] rounded-md p-4 shadow-lg backdrop:bg-black/40"
        ref={dialogRef}
        style={dialogSprings}
      >
        <h2 className="pb-2 text-xl font-bold">All progress will be lost</h2>
        <p className="text-sm">
          Your user guess history and country stats will be deleted.
        </p>
        <form className="flex justify-end gap-2 pt-4" method="dialog">
          <Button className="bg-transparent hover:bg-slate-900/10">
            Cancel
          </Button>
          <Button
            className="bg-red-700 text-white hover:bg-red-600"
            onClick={clearProgress}
          >
            Delete
          </Button>
        </form>
      </animated.dialog>

      <div className="flex w-full flex-1 gap-2 overflow-y-auto">
        <div className="flex flex-col gap-2 rounded-md bg-slate-800 p-2">
          <h2 className="text-lg font-bold">Options</h2>
          <Button
            className="w-max bg-transparent hover:bg-slate-400/40"
            onClick={showDialog}
            icon={faBroom}
            disabled={countryStatsList.length === 0}
          >
            Clear progress
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <h1 className="p-2 pb-4 text-xl font-bold">Country Stats</h1>
          {countryStatsList.length === 0 ? (
            <div className="flex flex-[0.3_0.3_30%] items-center justify-center">
              <div className="rounded-md border-2 border-dashed border-slate-600 p-6 text-center">
                <img
                  src={ThinkingFace}
                  className="mx-auto"
                  width={96}
                  height={96}
                  alt="No records found"
                />
                <h3 className="text-lg">No records found</h3>
                <p>
                  <Link to="/" className="text-blue-500 hover:underline">
                    Play the map
                  </Link>
                  &nbsp;to start recording your progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-fit flex-wrap overflow-y-auto p-2">
              {countryStatsList.map((countryStat) => (
                <CountryStatsCard
                  key={countryStat.alpha3}
                  countryStats={countryStat}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainView>
  );
}
