import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router";
import { InlineButton } from "src/components/activity/InlineButton";
import Toggle from "src/components/common/Toggle";
import { useFilteredCountriesContext } from "src/context/FilteredCountryData";
import { continents } from "src/context/FilteredCountryData/data";
import { useCountryStore } from "src/context/CountryStore";
import { type CountryData, type CountryDataList, type NullableCountryData } from "src/types/features";
import { cn } from "src/utils/styles";

type CountryListEntryProps = {
  storedCountry: NullableCountryData;
  countryClickCallback(a3: string): void;
};

function CountryListEntry({
  country,
  storedCountry,
  countryClickCallback,
}: CountryListEntryProps & { country: CountryData }) {
  return (
    <button
      id={country?.GU_A3}
      className={cn("-ml-2 -mr-1 flex items-center gap-2 rounded-sm pl-4 pr-1 text-left -indent-2", {
        "bg-yellow-700 py-1": country?.GU_A3 === storedCountry?.GU_A3,
      })}
      title={country?.GEOUNIT}
      onClick={() => countryClickCallback(country.GU_A3)}
    >
      {country?.GEOUNIT}
    </button>
  );
}

type ContinentListEntryProps = CountryListEntryProps & {
  isContinentAbridged: boolean;
  index: number;
  continent: string;
  continentCountries: CountryDataList;
  isContinentToggled: boolean;
  toggleContinentCallback(continent: string, toggle: boolean): void;
};

function ContinentListEntry({
  isContinentAbridged,
  index,
  continent,
  continentCountries,
  isContinentToggled,
  toggleContinentCallback,
  storedCountry,
  countryClickCallback,
}: ContinentListEntryProps) {
  return (
    <>
      <div
        className="sticky flex justify-between bg-slate-900 pb-1 pt-2 font-bold shadow-md"
        style={{
          top: `${index * 2.25}rem`,
        }}
      >
        <span className="truncate">{continent}</span>
        <div className="flex items-center gap-2 text-base">
          &#40;{continentCountries.length}&#41;
          <Toggle value={isContinentToggled} onChange={(toggle) => toggleContinentCallback(continent, toggle)} />
        </div>
      </div>

      {!isContinentAbridged && (
        <div
          className={twMerge("flex flex-col rounded-sm bg-slate-800 p-1 pl-2", isContinentToggled ? "flex" : "hidden")}
        >
          {continentCountries.map((country) => (
            <CountryListEntry
              key={country.GU_A3}
              country={country}
              countryClickCallback={countryClickCallback}
              storedCountry={storedCountry}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function CountriesListPanel({ isAbridged = false }: { isAbridged?: boolean }) {
  const { countryDataByContinent, getContinentFilter, toggleContinentFilter, toggleAllContinentFilters } =
    useFilteredCountriesContext();
  const { storedCountry } = useCountryStore();
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

    const countryButton = listRef.current?.querySelector(`#${storedCountry.data?.GU_A3}`);

    countryButton?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [storedCountry.data]);

  return (
    <div className={cn("flex h-max flex-col gap-2 pl-2", { "overflow-y-auto": !isAbridged })}>
      <h3 className="text-center text-slate-300">Countries by Region</h3>

      <div className="flex grow items-center justify-center gap-2 text-sm">
        <span>Toggle</span>
        <div className="flex">
          <InlineButton className="rounded-e-none border-e-2" small onClick={() => toggleAllContinentFilters(true)}>
            <FontAwesomeIcon icon={faGlobe} />
            <span>All</span>
          </InlineButton>
          <InlineButton className="rounded-s-none border-s-2" small onClick={() => toggleAllContinentFilters(false)}>
            <span>None</span>
          </InlineButton>
        </div>
      </div>

      <div className={cn("flex flex-col px-2", { "pb-[40vh]": !isAbridged })} ref={listRef}>
        {continents.map((continent, index) => (
          <ContinentListEntry
            key={continent}
            index={index}
            isContinentAbridged={isAbridged}
            continent={continent}
            isContinentToggled={getContinentFilter(continent)}
            continentCountries={countryDataByContinent.get(continent) ?? []}
            toggleContinentCallback={toggleContinentFilter}
            countryClickCallback={handleCountryClick}
            storedCountry={storedCountry.data}
          />
        ))}
      </div>
    </div>
  );
}
