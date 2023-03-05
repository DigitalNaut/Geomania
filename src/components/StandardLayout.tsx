import type { PropsWithChildren } from "react";

export default function StandardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      {children}
    </div>
  );
}
