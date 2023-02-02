import type { PropsWithChildren } from "react";

export default function InstructionOverlay({ children }: PropsWithChildren) {
  return (
    <div className="pointer-events-none absolute inset-1/2 z-[1000] flex h-max w-max -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-900/60 px-12 py-8 text-xl italic text-white">
      {children}
    </div>
  );
}
