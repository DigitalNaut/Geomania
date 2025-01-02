import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "src/store";
import { setActivity, setRandomReviewMode } from "src/store/MapActivity/slice";
import type { ActivityType } from "src/store/MapActivity/types";

export function useMapActivity() {
  const dispatch = useDispatch();
  const mapActivity = useSelector((state: RootState) => state.mapActivity);

  const dispatchSetActivity = (activity: ActivityType | undefined) => {
    dispatch(setActivity(activity));
  };

  const dispatchSetRandomReviewMode = (isRandomReviewMode: boolean) => {
    dispatch(setRandomReviewMode(isRandomReviewMode));
  };

  return { ...mapActivity, setActivity: dispatchSetActivity, setRandomReviewMode: dispatchSetRandomReviewMode };
}
