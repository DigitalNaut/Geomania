import type { Variants } from "motion/react";
import { motion } from "motion/react";

import { useSvgAttributes } from "src/hooks/common/useSVGAttributes";

import continentsSvg from "src/assets/images/generated/world-map-continents.svg?raw";

const overlayVariants: Variants = {
  initial: { opacity: 0 },
  visible: { opacity: 1 },
};

// TODO: Rename to "ContinentSelectionOverlay"
export default function RegionsToggleOverlay({ onClick }: { onClick: (id: string) => void }) {
  const { paths, viewBox } = useSvgAttributes(continentsSvg, ["width", "height", "viewBox"]);

  return (
    <motion.div
      className="absolute inset-0 z-[1000] bg-slate-900/90"
      variants={overlayVariants}
      initial="initial"
      animate="visible"
      exit="initial"
    >
      <div className="absolute inset-1/2 z-[1000] mx-auto flex size-max max-w-screen-sm -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-md bg-sky-900/70 p-3 shadow-md backdrop-blur-md hover:bg-sky-900">
        <h2 className="text-center text-2xl font-bold">Choose a region</h2>
        <div className="flex flex-col gap-4 text-center">
          <span>Select which continent to review:</span>

          <section className="flex w-auto flex-col gap-2 sm:h-auto sm:w-[30ch]">
            <div className="flex flex-1 flex-col gap-1 px-2">
              <svg viewBox={viewBox}>
                {paths.map((path) => (
                  <path
                    className="fill-sky-700 hover:cursor-pointer hover:fill-sky-500 active:fill-sky-600"
                    key={path.id}
                    onMouseUp={() => onClick(path.id)}
                    d={path.getAttribute("d") ?? ""}
                  />
                ))}
              </svg>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
