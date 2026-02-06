export function calculateAdjustedCycle(
  patterns: { actual_duration_days: number }[]
): number | null {
  if (!patterns || patterns.length === 0) return null;
  if (patterns.length === 1) return patterns[0].actual_duration_days;
  const sum = patterns.reduce((acc, p) => acc + p.actual_duration_days, 0);
  const avg = sum / patterns.length;
  if (!Number.isFinite(avg) || avg <= 0 || avg > 365) return null;
  return Math.round(avg);
}
