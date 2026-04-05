/**
 * Normalise API player docs for IPL25-style list / owner views.
 */

export function pointsObject(mapOrObj) {
  if (!mapOrObj) return {};
  if (mapOrObj instanceof Map) return Object.fromEntries(mapOrObj);
  return typeof mapOrObj === "object" ? mapOrObj : {};
}

/** @param {object} player */
export function buildPlayerMatchPointsList(player) {
  const pts = pointsObject(player.points);
  return Object.entries(pts)
    .map(([k, v]) => ({
      matchNumber: Number(k),
      points: Number(v?.final ?? v?.base ?? 0),
    }))
    .filter((x) => !Number.isNaN(x.matchNumber))
    .sort((a, b) => a.matchNumber - b.matchNumber);
}

const ROLE_ORDER = ["Batter", "Bowler", "Allrounder", "Wicketkeeper"];

/** Map free-form role string to IPL25-style bucket. */
export function roleBucket(role) {
  const r = String(role || "").toLowerCase();
  if (r.includes("wick") || r === "wk") return "Wicketkeeper";
  if (r.includes("all")) return "Allrounder";
  if (r.includes("bowl")) return "Bowler";
  if (r.includes("bat")) return "Batter";
  return "Batter";
}

export function roleSectionTitle(bucket) {
  if (bucket === "Batter") return "Batsmen";
  if (bucket === "Bowler") return "Bowlers";
  if (bucket === "Allrounder") return "All-Rounders";
  if (bucket === "Wicketkeeper") return "Wicket-keepers";
  return bucket;
}

export { ROLE_ORDER };

function normalizeBoostKey(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Captain / vice-captain for UI row + badges (`boosterTag` substring match).
 * @returns {"captain" | "vice" | null}
 */
export function cvRoleFromBoosterTag(boosterTag) {
  const raw = String(boosterTag || "");
  const t = normalizeBoostKey(raw);
  if (!t) return null;
  if (/vice\s*[-]?\s*captain/i.test(raw) || /vice\s+captain/i.test(raw))
    return "vice";
  if (t.includes("vice") && t.includes("captain")) return "vice";
  if (t.includes("captain")) return "captain";
  return null;
}

/**
 * Match `player.boosterTag` to `tournament.boosters[].name` and return multiplier.
 * Prefers the longest booster name that matches (e.g. "Vice Captain" over "Captain").
 * @param {object} player
 * @param {{ name: string, multiplier: number }[] | undefined} boosters
 * @returns {number | null}
 */
export function multiplierForPlayer(player, boosters) {
  const tag = normalizeBoostKey(player?.boosterTag);
  if (!tag || !Array.isArray(boosters) || !boosters.length) return null;
  /** Higher score wins: exact match, then longest booster name contained in tag. */
  let bestMult = null;
  let bestScore = -1;
  for (const b of boosters) {
    const name = normalizeBoostKey(b?.name);
    if (!name) continue;
    const m = Number(b.multiplier);
    if (!(m > 0) || Number.isNaN(m)) continue;
    let score = -1;
    if (tag === name) score = 1000 + name.length;
    else if (tag.includes(name)) score = name.length;
    else if (name.includes(tag)) score = tag.length;
    if (score > bestScore) {
      bestScore = score;
      bestMult = m;
    }
  }
  return bestMult;
}

/**
 * List points: with booster uses stored `totalPoints`; without divides by tournament multiplier when known.
 * @param {object} player
 * @param {boolean} applyBoost
 * @param {{ name: string, multiplier: number }[] | undefined} boosters
 */
export function getPlayerListPoints(player, applyBoost, boosters) {
  const total = Number(player?.totalPoints) || 0;
  if (applyBoost) return total;
  const mult = multiplierForPlayer(player, boosters);
  if (mult != null && mult !== 1) return total / mult;
  return total;
}

/** Avoid divide-by-zero when price missing or zero in DB. */
const MIN_AUCTION_PRICE = 1;

/**
 * “Steal of the auction”: points earned per unit of auction price (higher = better value).
 * Uses the same point total as the table (respects booster toggle).
 * Callers should omit unsold players before ranking (see `isUnsoldOwner`).
 *
 * @returns {{ points: number, price: number, value: number }}
 */
export function auctionValuePerPrice(player, applyBoost, boosters) {
  const points = getPlayerListPoints(player, applyBoost, boosters);
  const raw = Number(player?.price);
  const price =
    Number.isFinite(raw) && raw > 0 ? raw : MIN_AUCTION_PRICE;
  return {
    points,
    price,
    value: points / price,
  };
}

/**
 * Single highlight class for table/list rows (eliminated > injured > C/VC).
 * @param {object} player
 * @param {string} prefix BEM block prefix, e.g. `player-page__row` or `owner-players__item`
 */
export function playerRowHighlightClass(player, prefix) {
  if (player?.isEliminated) return `${prefix}--eliminated`;
  if (player?.isInjured) return `${prefix}--injured`;
  const cv = cvRoleFromBoosterTag(player?.boosterTag);
  if (cv === "captain") return `${prefix}--captain`;
  if (cv === "vice") return `${prefix}--vice`;
  return "";
}

/** @param {string} nationality */
export function nationalityKind(nationality) {
  const s = String(nationality || "")
    .trim()
    .toLowerCase();
  if (!s) return "INDIAN";
  if (s.includes("overseas") || s.includes("over sea") || s === "os")
    return "OVERSEAS";
  if (s.includes("india") || s === "in" || s === "ind") return "INDIAN";
  return "OVERSEAS";
}
