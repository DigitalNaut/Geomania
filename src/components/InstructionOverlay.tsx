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
      className="pointer-events-none absolute inset-0 z-[1000] m-auto flex h-max w-max items-center justify-center rounded-lg bg-gray-900/60 px-12 py-8 text-xl italic"
      style={springs}
    >
      {children}
    </animated.div>
  );
}
