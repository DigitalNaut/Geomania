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
  setUserSettings: Dispatch<ActionType>;
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

  return (
    <userSettingsContext.Provider
      value={{
        userSettings,
        setUserSettings,
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
