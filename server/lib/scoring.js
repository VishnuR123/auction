/**
 * @param {Array<{ name: string, multiplier: number }>} boosters
 * @param {string} boosterTag
 * @returns {number}
 */
function multiplierForTag(boosters, boosterTag) {
  if (!boosterTag || !Array.isArray(boosters)) return 1;
  const found = boosters.find((b) => b.name === boosterTag);
  return found && typeof found.multiplier === "number" ? found.multiplier : 1;
}

/**
 * @param {import("mongoose").Map|Record<string, { final?: number }>|undefined} points
 * @returns {number}
 */
function sumFinalPointsFromMap(points) {
  if (!points) return 0;
  let sum = 0;
  if (points instanceof Map) {
    for (const [, v] of points) {
      if (v && typeof v.final === "number") sum += v.final;
    }
    return sum;
  }
  for (const k of Object.keys(points)) {
    const v = points[k];
    if (v && typeof v.final === "number") sum += v.final;
  }
  return sum;
}

/**
 * Sums each owner's `final` for this match across all players (lean docs).
 * Keys are owner document _id strings (e.g. vishnu_ipl26). Uses `player.ownerId` only.
 * @param {Array<Record<string, unknown>>} playersLean
 * @param {unknown} _ownersLean unused (kept for call-site compatibility)
 * @param {number} matchNumber
 * @returns {Record<string, number>}
 */
function aggregateOwnerMatchPoints(playersLean, _ownersLean, matchNumber) {
  const matchKey = String(matchNumber);
  const totals = {};
  for (const p of playersLean) {
    const pts = p.points?.[matchKey];
    const final =
      pts && typeof pts.final === "number" && !Number.isNaN(pts.final)
        ? pts.final
        : 0;
    const oid = p.ownerId;
    if (!oid) continue;
    totals[oid] = (totals[oid] || 0) + final;
  }
  return totals;
}

module.exports = {
  multiplierForTag,
  sumFinalPointsFromMap,
  aggregateOwnerMatchPoints,
};
