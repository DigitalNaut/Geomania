import { useState } from "react";

import type { CountryFilters } from "src/contexts/CountryFiltersContext";
import { useCountryStore } from "src/hooks/useCountryStore";
import continents from "src/assets/data/continents.json";

export default function RegionsToggleList() {
  const { toggleContinentFilter, continentFilters } = useCountryStore();
  const [selectedContinents, setSelectedContinents] = useState<CountryFilters>(continentFilters);

  return (
    <section className="flex h-1/5 w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <div className="flex flex-1 flex-col overflow-y-auto text-ellipsis px-2">
        <div className="flex flex-col gap-1">
          {continents.map((continent) => (
            <label
              key={continent}
              className="flex w-full cursor-pointer justify-between px-1 italic hover:bg-white/30"
              htmlFor={continent}
            >
              <h3 className="text-lg font-bold">{continent}</h3>
              <input
                id={continent}
                type="checkbox"
                checked={selectedContinents[continent]}
                onChange={({ target, currentTarget }) => {
                  setSelectedContinents((currentContinents) => {
                    console.log(currentTarget.checked);

                    return {
                      ...currentContinents,
                      [continent]: target.checked,
                    };
                  });
                }}
              />
            </label>
          ))}
        </div>
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
