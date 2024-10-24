import { animated, useSpring } from "@react-spring/web";
import { useMemo, useState } from "react";

import Button from "src/components/common/Button";
import Toggle from "src/components/common/Toggle";
import { useCountryFilters, type CountryFilters } from "src/hooks/useCountryFilters";
import { continents } from "src/hooks/useCountryFilters/data";
import { cn } from "src/utils/styles";

type ListItemProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

function ToggleListItem({ id, checked, onChange, label }: ListItemProps) {
  return (
    <label
      className="flex w-full cursor-pointer items-center justify-between rounded-sm px-1 hover:bg-white/30"
      htmlFor={id}
    >
      <span>{label}</span>
      <Toggle id={id} value={checked} onChange={onChange} />
    </label>
  );
}

function createInitialToggles(continentFilters: CountryFilters) {
  return Object.fromEntries(Object.keys(continentFilters).map((continent) => [continent, false]));
}

function RegionsToggleList() {
  const { toggleContinentFilter, continentFilters } = useCountryFilters();
  const initialToggles = useMemo(() => createInitialToggles(continentFilters), [continentFilters]);
  const [selectedContinents, setSelectedContinents] = useState<CountryFilters>(initialToggles);

  const allContinentsSelected = Object.values(selectedContinents).every((toggle) => toggle);
  const noContinentsSelected = !Object.values(selectedContinents).some((toggle) => toggle);

  const handleToggleAll = (checked: boolean) => {
    setSelectedContinents(Object.fromEntries(Object.keys(selectedContinents).map((continent) => [continent, checked])));
  };
  const handleSubmit = () => {
    Object.entries(selectedContinents).forEach(([continent, toggle]) => {
      toggleContinentFilter(continent, toggle);
    });
    setSelectedContinents(initialToggles);
  };

  return (
    <section className="flex w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <div className="flex flex-1 flex-col gap-1 px-2">
        <ToggleListItem id="all" label="All" checked={allContinentsSelected} onChange={handleToggleAll} />

        <hr className="border-white" />
        {continents.map((continent) => (
          <ToggleListItem
            key={continent}
            id={continent}
            label={continent}
            checked={selectedContinents[continent]}
            onChange={(checked) => {
              setSelectedContinents((currentContinents) => ({
                ...currentContinents,
                [continent]: checked,
              }));
            }}
          />
        ))}
      </div>
      <Button disabled={noContinentsSelected} onClick={handleSubmit}>
        Start
      </Button>
    </section>
  );
}

export default function RegionsToggleOverlay({ shouldShow }: { shouldShow: boolean }) {
  const springs = useSpring({
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? "translateY(-50%) translateX(-50%)" : "translateY(-75%) translateX(-50%)",
  });

  return (
    <div
      className={cn("hidden pointer-events-none absolute inset-0 bg-slate-900/90 z-[1000]", {
        "block pointer-events-auto": shouldShow,
      })}
    >
      <animated.div
        className="absolute inset-1/2 z-[1000] mx-auto flex size-max -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-md bg-sky-900/70 p-3 shadow-md backdrop-blur-md hover:bg-sky-900"
        style={springs}
      >
        <h2 className="text-center text-2xl font-bold">No countries to review</h2>
        <div className="flex flex-col gap-4 text-center">
          <span>You have disabled all regions.</span>

          <RegionsToggleList />
        </div>
      </animated.div>
    </div>
  );
}
