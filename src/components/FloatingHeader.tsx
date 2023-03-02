import type { PropsWithChildren } from "react";

export default function FloatingHeader({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-x-1/2 top-5 z-[1000] h-max w-1/4 -translate-x-1/2 shadow-md">
      <h1 className="rounded-lg bg-slate-900 px-6 py-4 text-center text-2xl text-white">
        {children}
      </h1>
    </div>
  );
}