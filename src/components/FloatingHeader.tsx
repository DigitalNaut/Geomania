import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function FloatingHeader({ children }: PropsWithChildren) {
  const springs = useSpring({
    from: {
      opacity: 0,
      transform: "translateY(-100%)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0%)",
    },
  });

  return (
    <animated.div
      className="absolute inset-x-0 top-3 z-[1000] mx-auto h-max w-fit min-w-min shadow-md sm:min-w-max"
      style={springs}
    >
      <h1 className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 text-center text-lg sm:rounded-full sm:px-4 md:text-2xl">
        {children}
      </h1>
    </animated.div>
  );
}
