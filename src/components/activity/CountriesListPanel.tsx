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
      <div className={twMerge("flex flex-1 flex-col text-ellipsis px-2", !abridged && "overflow-y-auto")}>
        <div className="flex flex-col gap-3" ref={listRef}>
          {continents.map((continent) => (
            <details
              key={continent}
              className={"cursor-pointer rounded-md bg-blue-400/10"}
              open={continentFilters[continent]}
              onToggle={(event) => toggleContinentFilter(continent, event.currentTarget.open)}
            >
              <summary className={"flex justify-between px-1 font-bold"}>
                <span>{continent}</span>
                <div className="flex items-center gap-2 text-base">
                  &#40;{countryDataByContinent[continent].length}&#41;
                  <Toggle
                    value={continentFilters[continent]}
                    onChange={(toggle) => toggleContinentFilter(continent, toggle)}
                  />
                </div>
              </summary>
              {!abridged && (
                <div className="flex flex-col gap-1 rounded-sm p-1">
                  {countryDataByContinent[continent].map((country) => (
                    <button
                      className={twMerge(
                        "flex items-center gap-2 pl-2 pr-1 text-left -indent-2 rounded-md",
                        country?.a3 === storedCountry.data?.a3 && "bg-yellow-700",
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
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
