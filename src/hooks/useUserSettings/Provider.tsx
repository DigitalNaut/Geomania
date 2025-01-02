import type { PropsWithChildren } from "react";
import { useEffect, useReducer } from "react";

import { useLocalStorage } from "src/hooks/useLocalStorage";
import { UserSettingsContext } from ".";
import type { ActionType, UserSettings } from "./types";
import { userSettingsSchema } from "./types";

const USER_SETTINGS_KEY = "userSettings";
const defaultSettings = userSettingsSchema.parse({});

const settingsReducer = (state: UserSettings, { type, payload }: ActionType): UserSettings => {
  switch (type) {
    case "set":
      return {
        ...state,
        ...payload,
      };

    case "reset":
      return defaultSettings;

    default:
      return state;
  }
};

export function UserSettingsProvider({ children }: PropsWithChildren) {
  const { data: userSettingsInStorage, saveData: persistSettings } = useLocalStorage<UserSettings>(
    USER_SETTINGS_KEY,
    defaultSettings,
    userSettingsSchema,
  );
  const [userSettings, setUserSettings] = useReducer(settingsReducer, defaultSettings);

  const setUserSetting = (payload: Partial<UserSettings>) => {
    setUserSettings({ type: "set", payload });
    persistSettings({ ...userSettings, ...payload });
  };

  const resetUserSettings = () => {
    setUserSettings({ type: "reset", payload: {} });
    persistSettings(defaultSettings);
  };

  useEffect(() => {
    if (userSettingsInStorage) {
      setUserSettings({ type: "set", payload: userSettingsInStorage });
    }
  }, [userSettingsInStorage]);

  return (
    <UserSettingsContext
      value={{
        userSettings,
        setUserSetting,
        resetUserSettings,
      }}
    >
      {children}
    </UserSettingsContext>
  );
}
