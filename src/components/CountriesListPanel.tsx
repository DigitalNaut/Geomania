import { useEffect, useRef } from "react";

import type {
  CountriesDataByContinent,
  CountryData,
} from "src/hooks/useCountryStore";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapControl } from "src/hooks/useMapControl";
import continents from "src/data/continents.json";

const continentStyles = ["bg-green-700/30", "bg-blue-700/30"];

export default function CountriesListPanel({
  countriesByContinent,
  toggleContinent,
}: {
  countriesByContinent: CountriesDataByContinent;
  toggleContinent: (continent: string, toggle: boolean) => void;
}) {
  const { setStoredCountry, storedCountry: currentCountry } = useCountryStore();
  const { flyTo } = useMapControl();
  const listRef = useRef<HTMLDivElement>(null);

  const handleCountryClick = (country: CountryData) => {
    setStoredCountry(country);
    flyTo([country?.latitude || 0, country?.longitude || 0]);
  };

  // Scroll to the active country
  useEffect(() => {
    if (!currentCountry.data || !listRef.current) return;

    const countryButton = listRef.current?.querySelector(
      `#${currentCountry.data?.alpha3}`
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
              className={`cursor-pointer px-2 ${
                continentStyles[index % continentStyles.length]
              }`}
              open
              onToggle={(event) =>
                toggleContinent(continent, event.currentTarget.open)
              }
            >
              <summary className="flex justify-between">
                <h3 className="text-lg">{continent}</h3>
                <span className="text-base italic">
                  &#40;{countriesByContinent[continent].length}&#41;
                </span>
              </summary>
              <div className="flex flex-col gap-1 rounded-sm bg-slate-800 p-1">
                {countriesByContinent[continent].map((country) => (
                  <button
                    className={`flex items-center gap-2 pl-2 pr-1 text-left -indent-2 ${
                      country?.alpha3 === currentCountry.data?.alpha3
                        ? "bg-slate-700"
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
