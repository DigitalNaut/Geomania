import type { PropsWithChildren } from "react";
import { useEffect, useReducer } from "react";

import { useLocalStorage } from "src/hooks/useLocalStorage";
import { Provider } from ".";
import { defaultUserSettings } from "./defaults";
import type { ActionType, UserSettings } from "./types";
import { userSettingsSchema } from "./types";

const reducer = (state: UserSettings, { type, payload }: ActionType): UserSettings => {
  switch (type) {
    case "set":
      return {
        ...state,
        ...payload,
      };

    case "reset":
      return defaultUserSettings;

    default:
      return state;
  }
};

const userSettingsKey = "userSettings";

export function UserSettingsProvider({ children }: PropsWithChildren) {
  const { data: savedUserSettings, saveData: saveUserSettings } = useLocalStorage<UserSettings>(
    userSettingsKey,
    defaultUserSettings,
    userSettingsSchema,
  );
  const [userSettings, setUserSettings] = useReducer(reducer, defaultUserSettings);

  const setUserSetting = (payload: Partial<UserSettings>) => {
    setUserSettings({ type: "set", payload });
    saveUserSettings({ ...userSettings, ...payload });
  };

  const resetUserSettings = () => {
    setUserSettings({ type: "reset", payload: {} });
    saveUserSettings(defaultUserSettings);
  };

  useEffect(() => {
    if (savedUserSettings) {
      setUserSettings({ type: "set", payload: savedUserSettings });
    }
  }, [savedUserSettings]);

  return (
    <Provider
      value={{
        userSettings,
        setUserSetting,
        resetUserSettings,
      }}
    >
      {children}
    </Provider>
  );
}
