import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export default function InstructionOverlay({ shouldShow, children }: PropsWithChildren<{ shouldShow: boolean }>) {
  return (
    <motion.div
      className={twMerge(
        "absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-lg bg-gray-900/5 text-xl italic",
        shouldShow ? "pointer-events-auto" : "pointer-events-none",
      )}
      initial={false}
      animate={{ opacity: shouldShow ? 1 : 0 }}
    >
      {children}
    </motion.div>
  );
}
