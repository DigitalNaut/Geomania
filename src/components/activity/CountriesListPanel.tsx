import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef } from "react";
// import { useSearchParams } from "react-router";
import { twMerge } from "tailwind-merge";

import { InlineButton } from "src/components/activity/InlineButton";
import Toggle from "src/components/common/Toggle";
// import { useMapViewport } from "src/hooks/useMapViewport";
import { continentCatalog, countryCatalog } from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
// import { getCountryCoordinates } from "src/utils/features";
import { useActivityCoordinatorContext } from "src/context/ActivityCoordinator/hook";
import { cn } from "src/utils/styles";

function CountryListEntry({
  id,
  className,
  onClick,
}: {
  className?: string;
  id: string;
  onClick: (a3: string) => void;
}) {
  const countryName = useMemo(() => countryCatalog[id].GEOUNIT, [id]);

  return (
    <button id={id} className={className} title={countryName} onClick={() => onClick(id)}>
      {countryName}
    </button>
  );
}

type ContinentListEntryProps = {
  isContinentAbridged: boolean;
  index: number;
  continent: string;
  continentCountries: string[];
  storedCountry: CountryData | null;
  isContinentToggled: boolean;
  countryClickCallback: (a3: string) => void;
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
          className={twMerge(
            "flex flex-wrap gap-2 rounded-sm bg-slate-800 p-1 pl-2",
            isContinentToggled ? "flex" : "hidden",
          )}
        >
          {continentCountries.map((countryA3) => (
            <CountryListEntry
              key={countryA3}
              className={cn("flex items-center justify-center rounded-sm bg-white/10 px-2 py-0.5 text-center", {
                "bg-yellow-900": countryA3 === storedCountry?.GU_A3,
              })}
              id={countryA3}
              onClick={countryClickCallback}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function CountriesListPanel({ isAbridged = false }: { isAbridged?: boolean }) {
  const { currentActivityState, setCurrentCountry } = useActivityCoordinatorContext();
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to the active country
  useEffect(() => {
    if (!currentActivityState?.currentCountry) return;

    const countryButton = listRef.current?.querySelector(`#${currentActivityState.currentCountry.GU_A3}`);

    countryButton?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentActivityState?.currentCountry]);

  const handleCountryClick = (countryA3: string) => {
    setCurrentCountry(countryA3);
  };

  return (
    <div className={cn("flex flex-col gap-2 overflow-y-auto", { "overflow-y-auto": !isAbridged })}>
      <h3 className="text-center text-slate-300">Countries by Region</h3>

      <div className="flex grow items-center justify-center gap-2 text-sm">
        <span>Toggle</span>
        <div className="flex">
          <InlineButton
            className="rounded-e-none border-e-2"
            small
            title="Toggle all"
            onClick={() => console.log("toggle all")}
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span>All</span>
          </InlineButton>
          <InlineButton
            className="rounded-s-none border-s-2"
            small
            title="Toggle none"
            onClick={() => console.log("toggle none")}
          >
            <span>None</span>
          </InlineButton>
        </div>
      </div>
      <div className={cn("flex h-max flex-col gap-2 pl-2", { "overflow-y-auto": !isAbridged })}>
        <div className={cn("flex flex-col px-2", { "pb-[40vh]": !isAbridged })} ref={listRef}>
          {Object.keys(continentCatalog).map((continent, index) => (
            <ContinentListEntry
              key={continent}
              index={index}
              isContinentAbridged={isAbridged}
              continent={continent}
              isContinentToggled={continent === currentActivityState?.currentContinent}
              continentCountries={continentCatalog[continent]}
              toggleContinentCallback={() => console.log("Not implemented")}
              countryClickCallback={handleCountryClick}
              storedCountry={currentActivityState?.currentCountry || null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
