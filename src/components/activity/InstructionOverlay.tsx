import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";
import { twMerge } from "tailwind-merge";

export default function InstructionOverlay({ shouldShow, children }: PropsWithChildren<{ shouldShow: boolean }>) {
  const springs = useSpring({
    opacity: shouldShow ? 1 : 0,
    config: { duration: 200 },
  });

  return (
    <animated.div
      className={twMerge(
        "absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-lg bg-gray-900/5 text-xl italic backdrop-blur-sm",
        shouldShow ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={springs}
    >
      {children}
    </animated.div>
  );
}
