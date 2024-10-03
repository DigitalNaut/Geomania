const neutralStyle = "fill-slate-800 stroke-slate-400";

const scoreStyles = [
  "fill-lime-400 stroke-lime-400",
  "fill-green-400 stroke-green-400",
  "fill-yellow-600 stroke-yellow-400",
  "fill-orange-800 stroke-orange-400",
  "fill-red-900 stroke-red-400",
] as const;

export function qualifyScore(score: number) {
  const clampedScore = Math.min(score, scoreStyles.length - 1);

  if (clampedScore > scoreStyles.length - 1 || clampedScore < 0) {
    return neutralStyle;
  }

  return scoreStyles[clampedScore];
}
