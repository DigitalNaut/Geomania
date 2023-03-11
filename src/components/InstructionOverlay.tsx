import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function InstructionOverlay({ children }: PropsWithChildren) {
  const springs = useSpring({
    from: {
      opacity: 0,
      transform: "scale(2)",
    },
    to: {
      opacity: 1,
      transform: "scale(1)",
    },
  });

  return (
    <animated.div
      className="absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-lg bg-gray-900/30 text-xl italic"
      style={springs}
    >
      {children}
    </animated.div>
  );
}
