import { pointsObject } from "./playerView.js";

/**
 * Sum of per-match base fantasy points (before captain / vice multiplier).
 *
 * @param {object} player
 * @returns {number}
 */
export function sumBasePointsForPlayer(player) {
  const pts = pointsObject(player?.points);
  let sum = 0;
  for (const v of Object.values(pts)) {
    const b = Number(v?.base);
    if (Number.isFinite(b)) sum += b;
  }
  return sum;
}

/**
 * Boosted points = totalPoints − sum of all base points (extra from multipliers).
 *
 * @param {object} player
 * @returns {number}
 */
export function boostedPointsForPlayer(player) {
  const total = Number(player?.totalPoints) || 0;
  return total - sumBasePointsForPlayer(player);
}
