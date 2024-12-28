import { motion } from "motion/react";
import { useMemo, useState } from "react";

import Button from "src/components/common/Button";
import Toggle from "src/components/common/Toggle";
import { useCountryFilters } from "src/hooks/useCountryFilters";
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

function RegionsToggleList({ onStart }: { onStart?: () => void }) {
  const { toggleContinentFilter, continentFiltersList } = useCountryFilters();
  const [selection, setSelection] = useState(() => new Map(continentFiltersList));

  const allSelected = useMemo(() => [...selection].every(([_, checked]) => checked), [selection]);
  const someSelected = useMemo(() => ![...selection].some(([_, checked]) => checked), [selection]);

  const handleToggleAll = (checked: boolean) => {
    const newMap = new Map(continents.map((continent) => [continent, checked]));
    setSelection(newMap);
  };
  const handleSubmit = () => {
    // Transfer state
    for (const [continent, toggle] of selection) {
      toggleContinentFilter(continent, toggle);
    }

    // Reset state
    setSelection(new Map(continentFiltersList));

    // Run callback
    onStart?.();
  };

  return (
    <section className="flex w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
      <div className="flex flex-1 flex-col gap-1 px-2">
        <ToggleListItem id="all" label="All" checked={allSelected} onChange={handleToggleAll} />

        <hr className="border-white" />
        {continents.map((continent) => (
          <ToggleListItem
            key={continent}
            id={continent}
            label={continent}
            checked={selection.get(continent) ?? false}
            onChange={(checked) => {
              setSelection((currentContinents) => new Map(currentContinents.set(continent, checked)));
            }}
          />
        ))}
      </div>
      <Button disabled={someSelected} onClick={handleSubmit}>
        Start
      </Button>
    </section>
  );
}

export default function RegionsToggleOverlay({ shouldShow, onStart }: { shouldShow: boolean; onStart: () => void }) {
  return (
    <div
      className={cn("invisible pointer-events-none absolute inset-0 bg-slate-900/90 z-[1000]", {
        "visible pointer-events-auto": shouldShow,
      })}
    >
      <motion.div
        className="absolute inset-1/2 z-[1000] mx-auto flex size-max -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-md bg-sky-900/70 p-3 shadow-md backdrop-blur-md hover:bg-sky-900"
        animate={{
          opacity: shouldShow ? 1 : 0,
        }}
      >
        <h2 className="text-center text-2xl font-bold">Toggle regions</h2>
        <div className="flex flex-col gap-4 text-center">
          <span>Please select which region to view:</span>

          <RegionsToggleList onStart={onStart} />
        </div>
      </motion.div>
    </div>
  );
}
