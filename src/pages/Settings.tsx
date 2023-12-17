import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import { useUserSettingsContext } from "src/contexts/UserSettingsContext";
import { DriveAccessButton } from "src/components/drive/DriveAccess";
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
  label: string;
  description?: JSX.Element | string;
  info?: JSX.Element | string;
  small?: true;
}>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className={twMerge(small ? "text-md" : "text-lg")}>{label}</span>
        {children}
      </div>
      <div className="text-sm">{description}</div>
      <div className="text-sm italic">{info}</div>
    </div>
  );
}

function SettingsSection({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-4 rounded-md bg-white/5 px-3 py-4">{children}</div>;
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

          <SettingsSection>
            <SettingInfo
              label="Google Drive"
              description="Connect your Google Drive account to store your progress and settings."
              info={
                <>
                  No personal data or identifying information is stored. You can manage the stored information on your
                  Google Drive
                  <a
                    className="mx-[0.25em] text-blue-300 underline hover:text-blue-100"
                    href="https://drive.google.com/drive/settings"
                    target="_blank"
                    rel="noreferrer"
                  >
                    account settings
                  </a>
                  under the &ldquo;Manage apps&rdquo; tab.
                </>
              }
            >
              <DriveAccessButton />
            </SettingInfo>

            <SettingInfo small label="Auto connect">
              <Toggle
                value={userSettings.autoConnectDrive}
                onChange={(value) => setUserSetting({ autoConnectDrive: value })}
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
