import { useMemo } from "react";

import type { UserCountryStats } from "src/contexts/GuessRecordContext";
import MainView from "src/components/MainView";
import { useUserGuessRecord } from "src/contexts/GuessRecordContext";

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
    <span title={`Correct: ${correct}\nIncorrect: ${incorrect}`}>
      {Array.from({ length: adjustedCorrect }, (_, index) => (
        <span key={index} className="text-green-600">
          &#x25cf;
        </span>
      ))}
      {Array.from({ length: adjustedIncorrect }, (_, index) => (
        <span key={index} className="text-yellow-600">
          &#x25cf;
        </span>
      ))}
      {Array.from({ length: padEnd }, (_, index) => (
        <span key={index} className="text-gray-600">
          &#x25cf;
        </span>
      ))}
    </span>
  );
}

type CountryStatsWithKey = UserCountryStats[string] & {
  countryCode: string;
};

type CountryStatsProps = {
  key: string;
  countryStat: CountryStatsWithKey;
};

function CountryStats({ countryStat }: CountryStatsProps) {
  return (
    <div className="flex gap-2 p-4 hover:bg-white/10">
      <img
        className="h-[2.4rem] w-16 p-1"
        src={`https://countryflagsapi.com/svg/${countryStat.countryCode}`}
        alt={countryStat.countryCode}
        crossOrigin="anonymous"
        loading="lazy"
      />
      <div>
        <div
          className="line-clamp-2 w-32 text-ellipsis text-sm"
          title={countryStat.countryName}
        >
          {countryStat.countryName}
        </div>
        <CountryProgress
          correct={countryStat.correctGuesses}
          incorrect={countryStat.incorrectGuesses}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { countryStats } = useUserGuessRecord();

  const constructedCountryStatList: CountryStatsWithKey[] = useMemo(() => {
    const countryKeys = Object.keys(countryStats);
    const countryValues = Object.values(countryStats);

    return countryKeys.map((key, index) => {
      return {
        countryCode: key,
        ...countryValues[index],
      };
    });
  }, [countryStats]);

  return (
    <MainView className="items-center p-0 sm:flex-col">
      <h1 className="w-full p-2 pb-4 text-center text-xl">Country Stats</h1>
      <div className="flex w-full justify-center p-2">
        <div className="flex flex-wrap overflow-y-auto">
          {constructedCountryStatList.length === 0 ? (
            <>No records</>
          ) : (
            constructedCountryStatList.map((countryStat) => (
              <CountryStats
                key={countryStat.countryCode}
                countryStat={countryStat}
              />
            ))
          )}
        </div>
      </div>
    </MainView>
  );
}
