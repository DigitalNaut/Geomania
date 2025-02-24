import { useEffect, useMemo, useRef } from "react";

import { useActivityCoordinatorContext } from "src/context/ActivityCoordinator/hook";
import { useMapActivityContext } from "src/context/MapActivity/hook";
import { countryCatalog, selectCurrentContinent, selectCurrentCountryA3 } from "src/store/CountryStore/slice";
import { useAppSelector } from "src/store/hooks";
import { cn } from "src/utils/styles";

export default function CountriesListPanel({ isAbridged = false }: { isAbridged?: boolean }) {
  const { activity } = useMapActivityContext();
  const { setCurrentCountry, visitedCountries, unvisitedCountries } = useActivityCoordinatorContext();
  const getCurrentCountryA3 = useMemo(() => selectCurrentCountryA3(activity?.activity), [activity?.activity]);
  const currentCountryA3 = useAppSelector(getCurrentCountryA3);
  const getCurrentContinent = useMemo(() => selectCurrentContinent(activity?.activity), [activity?.activity]);
  const currentContinent = useAppSelector(getCurrentContinent);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to the active country
  useEffect(() => {
    if (!currentCountryA3) return;

    const countryButton = listRef.current?.querySelector(`#${currentCountryA3}`);

    countryButton?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentCountryA3]);

  const handleCountryClick = (countryA3: string) => {
    setCurrentCountry(countryA3);
  };

  const { visited, unvisited } = useMemo(
    () => ({
      visited: visitedCountries.map((countryA3) => countryCatalog[countryA3]),
      unvisited: unvisitedCountries.map((countryA3) => countryCatalog[countryA3]),
    }),
    [visitedCountries, unvisitedCountries],
  );

  return (
    <div className={cn("flex flex-col gap-2 overflow-y-auto", { hidden: isAbridged })}>
      <h3 className="mb-2 text-center md:text-lg">
        <div>Reviewing {visited.length + unvisited.length} countries in</div>
        <div className="font-bold text-lg md:text-xl">{currentContinent}</div>
      </h3>

      <div className="flex h-max flex-col gap-2 overflow-y-auto pl-2">
        <div className="flex- flex flex-wrap gap-2 px-2 pb-[40vh]" ref={listRef}>
          {visited.map(({ GEOUNIT, GU_A3 }) => (
            <button
              key={GU_A3}
              className="cursor-pointer rounded-md bg-lime-700 px-2 py-1 text-white"
              onClick={() => handleCountryClick(GU_A3)}
            >
              {GEOUNIT}
            </button>
          ))}

          {unvisited.map(({ GEOUNIT, GU_A3 }) => (
            <button
              key={GU_A3}
              className="cursor-pointer rounded-md bg-gray-600 px-2 py-1 text-white"
              onClick={() => handleCountryClick(GU_A3)}
            >
              {GEOUNIT}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
