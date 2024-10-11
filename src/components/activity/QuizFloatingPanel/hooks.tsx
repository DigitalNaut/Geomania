import { useSpring, useTrail } from "@react-spring/web";
import { useMemo } from "react";

export function useHorizontalShakeAnimation({
  onShakeStart,
  onShakeEnd,
  shakeAmount = 7,
  shakeDuration = 400,
}: {
  onShakeStart: () => void;
  onShakeEnd: () => void;
  shakeAmount?: number;
  shakeDuration?: number;
}) {
  const [{ x }, errorShakeApi] = useSpring(() => ({
    from: { x: 0 },
  }));

  const xShake = useMemo(() => {
    const shakeXStart = -shakeAmount;
    const shakeXEnd = shakeAmount;
    return x.to(
      [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
      [0, shakeXEnd, shakeXStart, shakeXEnd, shakeXStart, shakeXEnd, shakeXStart, 0],
    );
  }, [shakeAmount, x]);

  const startShake = () =>
    errorShakeApi.start({
      from: { x: 0 },
      to: { x: 1 },
      config: { duration: shakeDuration },
      onStart: onShakeStart,
      onRest: onShakeEnd,
    });

  return {
    startShake,
    xShake,
  };
}

export function useFloatingPanelSlideInAnimation(shouldShow: boolean) {
  const [firstTrail, secondTrail] = useTrail(2, {
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? "translateY(0%)" : "translateY(100%)",
  });

  return {
    firstTrail,
    secondTrail,
  };
}
