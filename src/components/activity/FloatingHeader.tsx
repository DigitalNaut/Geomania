import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function FloatingHeader({
  shouldShow,
  imageSrc,
  children,
}: PropsWithChildren<{
  shouldShow: boolean;
  imageSrc?: string;
}>) {
  const springs = useSpring({
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? "translateY(0%)" : "translateY(-100%)",
  });

  return (
    <animated.div
      className="absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit min-w-min items-center gap-2 sm:min-w-max"
      style={springs}
    >
      <h1 className="flex gap-2 bg-slate-800 pr-4 text-center text-lg shadow-md sm:rounded-full sm:pr-6 md:text-2xl">
        {imageSrc && <img src={imageSrc} width={42} height={42} />}
        {children}
      </h1>
    </animated.div>
  );
}
