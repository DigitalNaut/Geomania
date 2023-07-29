import { useEffect, useState } from "react";
import * as z from "zod";

const DriveSettingsSchema = z.object({
  autoConnectDrive: z.boolean().default(false),
});
const driveSettingsKey = "driveSettings";
const defaultDriveSettings = DriveSettingsSchema.parse({});

type DriveSettings = z.infer<typeof DriveSettingsSchema>;

export function DriveSettingsHook() {
  const [driveSettings, setDriveSettings] = useState<DriveSettings>(defaultDriveSettings);

  const updateDriveSettings = (settings: DriveSettings) => {
    localStorage.setItem(driveSettingsKey, JSON.stringify(settings));
    setDriveSettings(settings);
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem(driveSettingsKey);

    if (savedSettings) {
      try {
        const settings = DriveSettingsSchema.parse(JSON.parse(savedSettings));
        setDriveSettings(settings);
      } catch (e) {
        updateDriveSettings(defaultDriveSettings);
      }
    }
  }, []);

  const setAutoConnectDrive = (autoConnectDrive: boolean) =>
    void updateDriveSettings({ ...driveSettings, autoConnectDrive });

  const toggleAutoConnectDrive = () => void setAutoConnectDrive(!driveSettings.autoConnectDrive);

  const resetDriveSettings = () => void updateDriveSettings(defaultDriveSettings);

  return {
    driveSettings,
    setAutoConnectDrive,
    toggleAutoConnectDrive,
    resetDriveSettings,
  };
}
