import { useState } from "react";

import type { CountryFilters } from "src/contexts/CountryFiltersContext";
import { useCountryStore } from "src/hooks/useCountryStore";
import continents from "src/assets/data/continents.json";
import Toggle from "src/components/common/Toggle";

export default function RegionsToggleList() {
  const { toggleContinentFilter, continentFilters } = useCountryStore();
  const [selectedContinents, setSelectedContinents] = useState<CountryFilters>(continentFilters);

  return (
    <section className="flex h-1/5 w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto text-ellipsis px-2">
        {continents.map((continent) => (
          <label
            key={continent}
            className="flex w-full cursor-pointer items-center justify-between px-1 italic hover:bg-white/30"
            htmlFor={continent}
          >
            <h3 className="text-lg font-bold">{continent}</h3>
            <Toggle
              id={continent}
              checked={selectedContinents[continent]}
              onChange={(checked) => {
                setSelectedContinents((currentContinents) => ({
                  ...currentContinents,
                  [continent]: checked,
                }));
              }}
            />
          </label>
        ))}
      </div>
      <button
        className="underline"
        onClick={() => {
          Object.entries(selectedContinents).forEach(([continent, toggle]) => {
            toggleContinentFilter(continent, toggle);
          });
        }}
      >
        Enable selected
      </button>
    </section>
  );
}
