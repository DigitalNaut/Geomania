import { type PropsWithChildren, type Dispatch, createContext, useContext, useReducer } from "react";

type UserSettings = {
  reducedMotion: boolean;
};

type ActionType = {
  type: "set" | "reset";
  payload: Partial<UserSettings>;
};

type UserSettingsContext = {
  userSettings: UserSettings;
  setUserSetting: Dispatch<Partial<UserSettings>>;
  resetUserSettings: () => void;
};

const userSettingsContext = createContext<UserSettingsContext | null>(null);

const defaultUserSettings: UserSettings = {
  reducedMotion: false,
};

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

export default function UserSettingsProvider({ children }: PropsWithChildren) {
  const [userSettings, setUserSettings] = useReducer(reducer, defaultUserSettings);

  const setUserSetting = (payload: Partial<UserSettings>) => setUserSettings({ type: "set", payload });
  const resetUserSettings = () => setUserSettings({ type: "reset", payload: {} });

  return (
    <userSettingsContext.Provider
      value={{
        userSettings,
        setUserSetting,
        resetUserSettings,
      }}
    >
      {children}
    </userSettingsContext.Provider>
  );
}

export function useUserSettingsContext() {
  const context = useContext(userSettingsContext);
  if (!context) throw new Error("useUserSettingsContext must be used within a UserSettingsProvider");

  return context;
}
