import type { PropsWithChildren } from "react";

export default function FloatingHeader({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-x-1/2 top-3 z-[1000] h-max min-w-min -translate-x-1/2 shadow-md sm:min-w-max">
      <h1 className="rounded-lg bg-slate-800 px-6 py-4 text-center text-lg sm:rounded-full sm:px-10 md:text-2xl">
        {children}
      </h1>
    </div>
  );
}
