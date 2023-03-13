import { useEffect, useRef } from "react";

import type { CountryData } from "src/controllers/CountriesData";
import { getAllCountriesMetadata } from "src/controllers/CountriesData";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapControl } from "src/hooks/useMapControl";
import continents from "src/data/continents.json";

export default function CountriesListPanel() {
  const { setStoredCountry, storedCountry: currentCountry } = useCountryStore();
  const { flyTo } = useMapControl();
  const countriesList = getAllCountriesMetadata();
  const listRef = useRef<HTMLDivElement>(null);

  const handleCountryClick = (country: CountryData) => {
    setStoredCountry(country);
    flyTo([country?.latitude || 0, country?.longitude || 0]);
  };

  const countriesByContinent = continents.map((continent) => ({
    continent,
    countries: countriesList.filter(
      (country) => country?.continent === continent
    ),
  }));

  const continentStyles = [
    "bg-green-700/30",
    "bg-slate-700/30",
    "bg-red-700/30",
    "bg-blue-700/30",
    "bg-orange-700/30",
    "bg-yellow-700/30",
    "bg-purple-700/30",
  ];

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
          {countriesByContinent.map(({ continent, countries }, index) => (
            <details
              key={continent}
              className={`cursor-pointer px-2 ${continentStyles[index]}`}
              open
            >
              <summary className="flex justify-between">
                <h3 className="text-lg">{continent}</h3>
                <span className="text-base italic">
                  &#40;{countries.length}&#41;
                </span>
              </summary>
              <div className="flex flex-col gap-1 rounded-sm bg-slate-800 p-1">
                {countries.map((country) => (
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
