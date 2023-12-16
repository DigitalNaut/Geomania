import { useEffect } from "react";
import { useHeaderControllerContext } from "src/contexts/HeaderControllerContext";

export default function useHeaderController(clickCallback: () => void) {
  const { onClickCallback } = useHeaderControllerContext();

  useEffect(() => {
    // Assign new callback
    onClickCallback.current = () => clickCallback();
    // Reset header callback on unload
    return () => (onClickCallback.current = undefined);
  }, [clickCallback, onClickCallback]);
}
