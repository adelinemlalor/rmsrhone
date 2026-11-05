/** Priority weights: a "Must Do" idea is three times as likely as a "Maybe". */
export const PRIORITY_WEIGHT: Record<string, number> = { "Must Do": 3, "Want to Do": 2, Maybe: 1 };

/**
 * Weighted random choice among unscheduled ideas. `exceptId` avoids showing the
 * same idea twice in a row when there's another option. `rand` is injectable
 * so tests can be deterministic.
 */
export function randomPick<T extends { id: string; priority: string; scheduled: boolean }>(
  ideas: T[],
  exceptId: string | null = null,
  rand: () => number = Math.random,
): T | null {
  let pool = ideas.filter((i) => !i.scheduled);
  if (pool.length > 1 && exceptId) pool = pool.filter((i) => i.id !== exceptId);
  if (pool.length === 0) return null;
  const weights = pool.map((i) => PRIORITY_WEIGHT[i.priority] ?? 1);
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < pool.length; k++) {
    r -= weights[k]!;
    if (r < 0) return pool[k]!;
  }
  return pool[pool.length - 1]!;
}
