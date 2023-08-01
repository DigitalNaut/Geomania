import { useEffect, useState, useCallback } from "react";
import { type z } from "zod";

function saveSettingsToStorage<T extends Record<string, unknown>>(key: string, callback: (settings: T) => void) {
  return (settings: T) => {
    localStorage.setItem(key, JSON.stringify(settings));
    callback(settings);
  };
}

export function useLocalStorage<T extends Record<string, unknown>>(key: string, defaultData: T, schema: z.Schema) {
  const [data, setData] = useState<T>(defaultData);

  const saveData = useCallback((newSettings: T) => saveSettingsToStorage<T>(key, setData)(newSettings), [key]);

  useEffect(() => {
    // Load settings from local storage
    const savedSettings = localStorage.getItem(key);
    // If no settings are saved, save the default settings
    if (!savedSettings) saveData(defaultData);
    else
      try {
        // If settings are saved, try to parse them
        const parsedSettings = JSON.parse(savedSettings);
        const validatedSettings = schema.parse(parsedSettings);
        setData(validatedSettings);
      } catch (e) {
        // If parsing fails, reset to default settings
        console.error("Could not parse settings from local storage, resetting to default settings");
        saveData(defaultData);
      }
  }, [defaultData, key, schema, saveData]);

  return { data, saveData };
}
