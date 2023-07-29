import { type PropsWithChildren } from "react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function ActivityButton({
  label,
  children,
  onClick,
  className,
}: PropsWithChildren<{
  label: string;
  onClick: () => void;
  className?: string;
}>) {
  return (
    <button
      role="button"
      className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
      onClick={onClick}
    >
      <div className={`m-auto flex w-fit items-center gap-4 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">{label}</h2>
          <p className="inline-block max-w-[40ch] text-base">{children}</p>
        </div>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </button>
  );
}
