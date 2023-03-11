import type { PropsWithChildren } from "react";
import { animated, useSpring } from "@react-spring/web";
import { Button } from "src/components/Button";

export default function FloatingHeader({
  shouldShow,
  children,
  imageSrc,
  button,
}: PropsWithChildren<{
  shouldShow: boolean;
  imageSrc?: string;
  button?: {
    label: string;
    onClick: () => void;
  };
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
      {imageSrc && <img src={imageSrc} width={42} height={42} />}
      <h1 className="bg-slate-800 py-2 px-4 text-center text-lg shadow-md sm:rounded-full sm:px-6 md:text-2xl">
        {children}
      </h1>
      {button && (
        <Button
          className="w-fit rounded-md bg-slate-500 text-base hover:bg-yellow-600"
          onClick={button?.onClick}
        >
          {button?.label}
        </Button>
      )}
    </animated.div>
  );
}
