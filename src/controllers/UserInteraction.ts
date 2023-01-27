import type { Feature } from "geojson";
import { useRef, useState } from "react";

import { normalizeName, joinName } from "src/utility";
import {
  getCountryGeometry,
  getNextCountry,
} from "src/controllers/MapController";
import { useMapContext } from "src/controllers/MapContext";

export default function useUserInteractions() {
  const { map, countryData, setCountryData } = useMapContext();
  const [userInput, setUserInput] = useState("");
  const [cheat, setCheat] = useState("");
  const [countryFeature, setCountryFeature] = useState<Feature>();

  const hasCountryData = () => !!(map && setCountryData);
  const inputRef = useRef<HTMLInputElement>(null);

  function nextCountry() {
    const { country } = getNextCountry(true);
    setCountryData(country);
    const feature = getCountryGeometry(country.alpha3) as Feature;
    setCountryFeature(feature);

    console.log(
      "Next country:",
      country.name,
      country.latitude,
      country.longitude,
      map
    );

    map?.flyTo([country.latitude, country.longitude], 5, {
      animate: true,
      duration: 0.1,
    });

    return country;
  }

  const onCheat = () => setUserInput(joinName(countryData?.name || ""));

  const onSubmit = () => {
    const answer = joinName(countryData?.name || "");
    const inputMatchesAnswer =
      normalizeName(userInput) === normalizeName(answer);

    setCheat(inputMatchesAnswer ? "" : answer);

    if (!countryData?.name) nextCountry();
    else if (inputMatchesAnswer)
      setUserInput(nextCountry()?.name.charAt(0) || "");

    if (countryData) inputRef.current?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") onSubmit();
  };

  return {
    userInput,
    setUserInput,
    cheat,
    onCheat,
    setCheat,
    countryData,
    countryGeometry: countryFeature,
    onSubmit,
    onKeyDown,
    inputRef,
    hasCountryData,
  };
}
