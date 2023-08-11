import { useUserSettingsContext } from "src/contexts/UserSettingsContext";
import Toggle from "src/components/common/Toggle";
import MainView from "src/components/layout/MainView";
import { Button } from "src/components/common/Button";

export default function Settings() {
  const { userSettings, setUserSettings } = useUserSettingsContext();

  return (
    <MainView className="sm:flex-col">
      <h1 className="w-full p-2 text-center text-xl">Preferences</h1>
      <div className="flex w-full flex-1 gap-2 overflow-y-auto p-4">
        <div className="mx-auto flex flex-col gap-2 rounded-md bg-slate-800 p-8">
          <span className="flex items-center gap-2">
            <span>Use reduced motion</span>
            <Toggle
              value={userSettings.reducedMotion}
              onChange={(value) => setUserSettings({ type: "set", payload: { reducedMotion: value } })}
            />
          </span>
          <Button onClick={() => setUserSettings({ type: "reset", payload: {} })}>Restore defaults</Button>
        </div>
      </div>
    </MainView>
  );
}
