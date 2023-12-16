import { useUserSettingsContext } from "src/contexts/UserSettingsContext";
import Toggle from "src/components/common/Toggle";
import MainView from "src/components/layout/MainView";
import Button from "src/components/common/Button";

function SettingToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        {label}
        <Toggle value={value} onChange={onChange} />
      </div>
      <span className="text-sm italic">{description}</span>
    </div>
  );
}

export default function Settings() {
  const { userSettings, setSetting, resetSettings } = useUserSettingsContext();

  return (
    <MainView className="sm:flex-col">
      <h1 className="w-full p-2 text-center text-xl">Preferences</h1>
      <div className="flex w-full flex-1 gap-2 overflow-y-auto p-4">
        <div className="mx-auto flex flex-col gap-4 rounded-md bg-slate-800 p-8 shadow-2xl">
          <SettingToggle
            label="Reduced motion"
            description="Use snappy transitions and animations to reduce motion sickness."
            value={userSettings.reducedMotion}
            onChange={(value) => setSetting({ reducedMotion: value })}
          />
          <Button onClick={resetSettings}>Restore defaults</Button>
        </div>
      </div>
    </MainView>
  );
}
