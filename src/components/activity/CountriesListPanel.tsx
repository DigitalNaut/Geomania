import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

import { useCountryStore } from "src/hooks/useCountryStore";
import continents from "src/assets/data/continents.json";
import Toggle from "src/components/common/Toggle";
import { useSearchParams } from "react-router-dom";

export default function CountriesListPanel({ abridged = false }: { abridged?: boolean }) {
  const { storedCountry, toggleContinentFilter, countryDataByContinent, continentFilters } = useCountryStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [, setURLSearchParams] = useSearchParams();

  const handleCountryClick = (a3: string) => {
    setURLSearchParams((prev) => {
      prev.set("country", a3);
      return prev;
    });
  };

  // Scroll to the active country
  useEffect(() => {
    if (!storedCountry.data || !listRef.current) return;

    const countryButton = listRef.current?.querySelector(`#${storedCountry.data?.a3}`);

    countryButton?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [storedCountry.data]);

  return (
    <div className={twMerge("flex h-max flex-col gap-2", !abridged && "overflow-y-auto")}>
      <h3 className="text-center text-slate-300">Countries by Region</h3>

      <div className={twMerge("flex flex-col overflow-y-auto px-2", !abridged && "pb-[60vh]")} ref={listRef}>
        {continents.map((continent, index) => (
          <>
            <div
              key={continent + "-summary"}
              className="sticky flex justify-between bg-slate-900 pb-1 pt-2 font-bold shadow-md"
              style={{
                top: `${index * 2.25}rem`,
              }}
            >
              <span>{continent}</span>
              <div className="flex items-center gap-2 text-base">
                &#40;{countryDataByContinent[continent].length}&#41;
                <Toggle
                  value={continentFilters[continent]}
                  onChange={(toggle) => toggleContinentFilter(continent, toggle)}
                />
              </div>
            </div>

            {!abridged && (
              <div
                key={continent + "-details"}
                className={twMerge(
                  "flex flex-col rounded-sm bg-slate-800 p-1 pl-2",
                  continentFilters[continent] ? "flex" : "hidden",
                )}
              >
                {countryDataByContinent[continent].map((country) => (
                  <button
                    className={twMerge(
                      "flex items-center gap-2 pl-4 -ml-2 -mr-1 pr-1 text-left -indent-2 rounded-sm",
                      country?.a3 === storedCountry.data?.a3 && "bg-yellow-700 py-1",
                    )}
                    id={country?.a3}
                    key={country?.a3}
                    title={country?.name}
                    onClick={() => handleCountryClick(country.a3)}
                  >
                    {country?.name}
                  </button>
                ))}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}
