import { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJsonObject } from 'geojson';
import { User } from 'realm-web';

import { normalizeString, unsplitName } from 'src/utility';

import { newRandomCountry } from 'src/controllers/MapController';
import { getCountryGeometry } from 'src/controllers/UserData';
import { useMapContext } from 'src/controllers/MapContext';

type ICountryGeometry = GeoJsonObject & {
  properties: {
    ADMIN: string;
    ISO_A3: string;
  };
};

export default function useUserInteraction(user: User | null) {
  const { map, countryData, setCountryData, countryCoords } = useMapContext();
  const [userInput, setUserInput] = useState('');
  const [cheat, setCheat] = useState('');
  const [countryGeometry, setCountryGeometry] = useState<ICountryGeometry>();

  const hasCountryData = useMemo(() => !!(map && setCountryData), [map, setCountryData]);
  const inputRef = useRef<HTMLInputElement>(null);

  function nextCountry() {
    const newCountry = newRandomCountry();
    setCountryData?.(newCountry);

    return newCountry;
  }

  const answer = useMemo(() => unsplitName(countryData?.name || ''), [countryData?.name]);

  const inputMatchesAnswer = () => normalizeString(userInput) === normalizeString(answer);
  const focusInput = () => inputRef.current?.focus();
  const onCheat = () => setUserInput(unsplitName(countryData?.name || ''));

  const onSubmit = () => {
    setCheat(inputMatchesAnswer() ? '' : answer);

    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

    if (!countryData?.name) nextCountry();
    else if (inputMatchesAnswer()) setUserInput(nextCountry()?.name.charAt(0) || '');

    focusInput();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === 'Enter') onSubmit();
  };

  // Center map when coords change
  useEffect(() => {
    if (countryCoords) map?.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });
  }, [map, countryCoords]);

  // Get country geometry when country data changes
  useEffect(() => {
    (async function getGeometry() {
      if (!user || !countryData) return;

      const geometry = (await getCountryGeometry(user, countryData.alpha3)) as unknown;

      setCountryGeometry(
        geometry as GeoJsonObject & {
          properties: {
            ADMIN: string;
            ISO_A3: string;
          };
        },
      );
    })();
  }, [user, countryData]);

  return {
    userInput,
    setUserInput,
    cheat,
    onCheat,
    setCheat,
    countryData,
    countryGeometry,
    onSubmit,
    onKeyDown,
    inputRef,
    hasCountryData,
  };
}
