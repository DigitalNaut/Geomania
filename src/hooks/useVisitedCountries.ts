import { useState } from "react";

import { type VisitedCountry } from "src/components/map/MapSvg";

export function useVisitedCountries() {
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);

  const pushVisitedCountry = (a3: string, style: string) => {
    setVisitedCountries((prevVisited) => {
      const visitedIndex = visitedCountries.findIndex((country) => country.a3 === a3);

      if (visitedIndex === -1) return [...prevVisited, { a3, style }];

      const splicedVisited = prevVisited.splice(visitedIndex, 1);
      return [...splicedVisited, { a3, style }];
    });
  };

  const setVisitedCountry = (a3: string) => {
    let changed = false;

    setVisitedCountries((prevVisited) => {
      const filtered = prevVisited.filter((country) => country.a3 !== a3);
      if (filtered.length !== prevVisited.length) changed = true;
      return filtered;
    });

    return changed;
  };

  const resetVisitedCountries = () => setVisitedCountries([]);

  return { visitedCountries, pushVisitedCountry, setVisitedCountry, resetVisitedCountries };
}
