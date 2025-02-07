import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

import { cn } from "src/utils/styles";

const activityButtonStyles = {
  review: "hover:bg-linear-to-br hover:from-lime-500/50 hover:to-lime-600/50",
  quiz: "hover:bg-linear-to-br hover:from-yellow-500/50 hover:to-yellow-600/50",
};

export function ActivityButton({
  type,
  icon,
  label,
  summary,
  onClick,
}: {
  type: keyof typeof activityButtonStyles;
  icon: ReactNode;
  label: ReactNode;
  summary?: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      role="button"
      className={cn(
        activityButtonStyles[type],
        "group flex w-full max-w-full min-w-max cursor-pointer items-center justify-center gap-6 bg-slate-900/50 p-10 outline outline-slate-200/0 backdrop-blur-xs transition-all first:rounded-t-2xl last:rounded-b-2xl hover:outline-slate-200/15",
      )}
      onClick={onClick}
    >
      <div className="flex gap-8">
        <span className="text-4xl">{icon}</span>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xl">{label}</span>
          <span className="italic opacity-50">{summary}</span>
        </div>
      </div>
      <FontAwesomeIcon icon={faChevronRight} className="text-3xl text-white/10 group-hover:text-white/30" />
    </button>
  );
}
