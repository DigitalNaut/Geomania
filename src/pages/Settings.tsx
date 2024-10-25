import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import { useUserSettingsContext } from "src/hooks/useUserSettings";
import MainView from "src/components/layout/MainView";
import Toggle from "src/components/common/Toggle";
import Button from "src/components/common/Button";

function SettingInfo({
  label,
  description,
  info,
  small,
  children,
}: PropsWithChildren<{
  label: JSX.Element | string;
  description?: JSX.Element | string;
  info?: JSX.Element | string;
  small?: true;
}>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className={twMerge(small ? "text-md" : "text-lg")}>{label}</div>
        {children}
      </div>
      <div className="text-sm">{description}</div>
      <div className="text-sm italic">{info}</div>
    </div>
  );
}

function SettingsSection({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-4 rounded-md bg-white/5 px-6 py-4">{children}</div>;
}

export default function Settings() {
  const { userSettings, setUserSetting, resetUserSettings } = useUserSettingsContext();

  const reset = () => {
    resetUserSettings();
  };

  return (
    <MainView className="sm:flex-col">
      <h1 className="w-full p-2 text-center text-xl font-bold">Preferences</h1>
      <div className="flex w-full flex-1 gap-2 overflow-y-auto p-4">
        <div className="mx-auto flex flex-col gap-4 rounded-md bg-slate-800 p-8 shadow-2xl">
          <SettingsSection>
            <SettingInfo
              label="Reduced motion"
              description="Use snappy transitions and animations to reduce motion sickness."
            >
              <Toggle
                value={userSettings.reducedMotion}
                onChange={(value) => setUserSetting({ reducedMotion: value })}
              />
            </SettingInfo>
          </SettingsSection>

          <div className="mt-4 flex w-full justify-end">
            <Button onClick={reset} styles="secondary">
              Restore defaults
            </Button>
          </div>
        </div>
      </div>
    </MainView>
  );
}
