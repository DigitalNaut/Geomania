import { useEffect, useRef } from "react";

import type { CountryData } from "src/hooks/useCountryStore";
import {
  useCountryStore,
  getCountryCoordinates,
} from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";
import continents from "src/assets/data/continents.json";

const continentStyles = [
  "bg-green-400/10",
  "bg-white/10",
  "bg-red-400/10",
  "bg-blue-400/10",
  "bg-orange-400/10",
  "bg-yellow-400/10",
  "bg-purple-400/10",
];

export default function CountriesListPanel() {
  const {
    setStoredCountry,
    storedCountry: currentCountry,
    toggleContinentFilter,
    countryDataByContinent,
    continentFilters,
  } = useCountryStore();
  const { flyTo } = useMapViewport();
  const listRef = useRef<HTMLDivElement>(null);

  const handleCountryClick = (country: CountryData) => {
    setStoredCountry(country);
    flyTo(getCountryCoordinates(country));
  };

  // Scroll to the active country
  useEffect(() => {
    if (!currentCountry.data || !listRef.current) return;

    const countryButton = listRef.current?.querySelector(
      `#${currentCountry.data?.alpha3}`,
    );

    countryButton?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentCountry.data]);

  return (
    <div className="flex h-1/5 w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <h2 className="text-center text-xl italic text-slate-300">
        Countries by Region
      </h2>
      <div className="flex flex-1 flex-col overflow-y-auto text-ellipsis px-2">
        <div className="flex flex-col gap-3" ref={listRef}>
          {continents.map((continent, index) => (
            <details
              key={continent}
              className={`cursor-pointer ${
                continentStyles[index % continentStyles.length]
              }`}
              open
              onToggle={(event) =>
                toggleContinentFilter(continent, event.currentTarget.open)
              }
            >
              <summary
                className={`flex justify-between px-1 italic ${
                  continentFilters[continent] ? "" : "line-through"
                }`}
              >
                <h3 className="text-lg font-bold">{continent}</h3>
                <span className="text-base">
                  &#40;{countryDataByContinent[continent].length}&#41;
                </span>
              </summary>
              <div className="flex flex-col gap-1 rounded-sm p-1">
                {countryDataByContinent[continent].map((country) => (
                  <button
                    className={`flex items-center gap-2 pl-2 pr-1 text-left -indent-2 ${
                      country?.alpha3 === currentCountry.data?.alpha3
                        ? "bg-yellow-700"
                        : ""
                    }`}
                    id={country?.alpha3}
                    key={country?.alpha3}
                    title={country?.name}
                    onClick={() => handleCountryClick(country)}
                  >
                    {country?.name}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
