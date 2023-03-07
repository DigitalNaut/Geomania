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
    <div>
      <span className="text-green-600">{"●".repeat(adjustedCorrect)}</span>
      <span className="text-yellow-600">{"●".repeat(adjustedIncorrect)}</span>
      <span className="text-gray-600">{"●".repeat(padEnd)}</span>
    </div>
  );
}

type CountryStatsWithKey = UserCountryStats[string] & {
  countryCode: string;
};

type CountryStatsProps = {
  countryStat: CountryStatsWithKey;
};

function CountryStats({ countryStat }: CountryStatsProps) {
  return (
    <div
      className="flex gap-2 rounded-md p-4 hover:bg-white/10"
      title={`${countryStat.countryName}\nCorrect: ${countryStat.correctGuesses}\nIncorrect: ${countryStat.incorrectGuesses}`}
    >
      <img
        className="before:bg-custom-unknown-flag h-[2.4rem] w-16 p-1 before:block before:h-[2.4rem] before:w-16"
        src={`https://countryflagsapi.com/svg/${countryStat.countryCode}`}
        alt={countryStat.countryCode}
        crossOrigin="anonymous"
        loading="lazy"
      />
      <div>
        <div className="line-clamp-2 w-32 text-ellipsis text-sm">
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

const countryStatsAbcSort = (
  a: UserCountryStats[string],
  b: UserCountryStats[string]
) => a.countryName.localeCompare(b.countryName);

export default function Dashboard() {
  const { countryStats } = useUserGuessRecord();

  const constructedCountryStatList: CountryStatsWithKey[] | undefined =
    useMemo(() => {
      const countryKeys = Object.keys(countryStats);
      const countryValues = Object.values(countryStats);

      return countryValues
        .sort(countryStatsAbcSort)
        .map((country: UserCountryStats[string], index) => ({
          ...country,
          countryCode: countryKeys[index],
        }));
    }, [countryStats]);

  return (
    <MainView className="items-center sm:flex-col">
      <h1 className="w-full p-2 pb-4 text-center text-xl">Country Stats</h1>
      <div className="flex w-full justify-center overflow-y-auto">
        <div className="flex flex-wrap overflow-y-auto p-2">
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
