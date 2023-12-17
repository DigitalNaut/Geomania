import { useLocalStorage } from "src/hooks/useLocalStorage";
import * as z from "zod";

const driveSettingsSchema = z.object({
  autoConnectDrive: z.boolean().default(false),
});
const defaultDriveSettings = driveSettingsSchema.parse({});
const driveSettingsKey = "driveSettings";

type DriveSettings = z.infer<typeof driveSettingsSchema>;

export default function DriveSettingsHook() {
  const { data: driveSettings, saveData: saveDriveSettings } = useLocalStorage<DriveSettings>(
    driveSettingsKey,
    defaultDriveSettings,
    driveSettingsSchema,
  );

  const setAutoConnectDrive = (autoConnectDrive: boolean) => void saveDriveSettings({ autoConnectDrive });

  const resetDriveSettings = () => void saveDriveSettings(defaultDriveSettings);

  return {
    resetDriveSettings,
    driveSettings,
    setAutoConnectDrive,
  };
}
