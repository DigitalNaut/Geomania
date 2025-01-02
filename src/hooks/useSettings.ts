import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "src/store";
import { resetUserSettings, setUserSettings } from "src/store/UserSettings/slice";

export function useSettings() {
  const dispatch = useDispatch();
  const { useReducedMotion } = useSelector((state: RootState) => state.settings);

  const resetSettings = () => dispatch(resetUserSettings());

  const toggleUseReducedMotion = () => dispatch(setUserSettings({ useReducedMotion: !useReducedMotion }));

  return { useReducedMotion, resetSettings, toggleUseReducedMotion };
}
