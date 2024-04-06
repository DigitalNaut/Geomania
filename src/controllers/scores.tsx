import { twMerge } from "tailwind-merge";

const neutralStyle = "fill-slate-800 stroke-slate-400";

const scoreStyles = [
  "fill-lime-400 stroke-lime-400",
  "fill-green-400 stroke-green-400",
  "fill-yellow-600 stroke-yellow-400",
  "fill-orange-800 stroke-orange-400",
  "fill-red-900 stroke-red-400",
] as const;

export function ScoresVisualizer({ className }: { className?: string }) {
  return (
    <div className={twMerge("flex mx-2 border-white border", className)}>
      {scoreStyles.map((style, index) => (
        <svg className="grow" key={index}>
          <rect className={twMerge(style, "size-full")} />
        </svg>
      ))}
    </div>
  );
}

export function qualifyScore(score: number) {
  const clampedScore = Math.min(score, scoreStyles.length - 1);
  for (let i = 0; i < scoreStyles.length; i++) {
    if (clampedScore === i) return scoreStyles[i];
  }

  return neutralStyle;
}
