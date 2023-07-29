import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function InstructionOverlay({ shouldShow, children }: PropsWithChildren<{ shouldShow: boolean }>) {
  const springs = useSpring({
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? "scale(1)" : "scale(1.5)",
    config: { duration: 200 },
  });

  return (
    <animated.div
      className={`absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-lg bg-gray-900/10 text-xl italic ${
        shouldShow ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={springs}
    >
      {children}
    </animated.div>
  );
}
