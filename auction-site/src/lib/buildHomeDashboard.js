/**
 * Build IPL25-style home dashboard structures from fantasy API documents.
 */

import { isUnsoldOwner } from "./ownerUtils.js";

function pointsObject(mapOrObj) {
  if (!mapOrObj) return {};
  if (mapOrObj instanceof Map) return Object.fromEntries(mapOrObj);
  return typeof mapOrObj === "object" ? mapOrObj : {};
}

function sanitizeRowClass(name) {
  return name.replace(/\s+/g, "-").replace(/^\d/, "_$&");
}

/** Parse #RGB / #RRGGBB for line-chart stroke pick. */
function hexToRgb(hex) {
  if (hex == null || typeof hex !== "string") return null;
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    return {
      r: parseInt(h[1] + h[1], 16),
      g: parseInt(h[2] + h[2], 16),
      b: parseInt(h[3] + h[3], 16),
    };
  }
  if (h.length === 7 && /^#[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(1, 3), 16),
      g: parseInt(h.slice(3, 5), 16),
      b: parseInt(h.slice(5, 7), 16),
    };
  }
  return null;
}

/** True if the color is white or light enough to be invisible on a light chart background. */
function isWhitishPrimary(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  if (r >= 232 && g >= 232 && b >= 232) return true;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum >= 0.9;
}

const GRAPH_LINE_FALLBACK = "#334155";

/** Owner graph stroke: use secondary when primary is whitish (live dashboard line chart only). */
function graphLineColor(primary, secondary) {
  const p = primary ?? "#64748b";
  const s = secondary ?? "#94a3b8";
  if (!isWhitishPrimary(p)) return p;
  if (!isWhitishPrimary(s)) return s;
  return GRAPH_LINE_FALLBACK;
}

/** UTC calendar day from a Date — fallback when matchDate is absent. */
function utcCalendarDayKey(dateInput) {
  if (dateInput == null) return null;
  const t = new Date(dateInput);
  if (Number.isNaN(t.getTime())) return null;
  return t.toISOString().slice(0, 10);
}

/**
 * Prefer date-only `matchDate` (YYYY-MM-DD) from API; else `createdAt` UTC day.
 */
function matchdayCalendarDayKey(md) {
  if (!md) return null;
  const raw = md.matchDate;
  if (raw != null && String(raw).trim() !== "") {
    const s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }
  return utcCalendarDayKey(md.createdAt);
}

/**
 * Latest matchday by matchNumber, plus other matchdays with the same calendar day
 * (matchDate, or createdAt if matchDate missing).
 */
function matchdaysOnLatestCalendarDay(sortedMds) {
  if (!sortedMds.length) return [];
  const latest = sortedMds[sortedMds.length - 1];
  const dayKey = matchdayCalendarDayKey(latest);
  if (dayKey == null) {
    return [latest];
  }
  const sameDay = sortedMds.filter(
    (md) => matchdayCalendarDayKey(md) === dayKey
  );
  return sameDay.length > 0 ? sameDay : [latest];
}

/**
 * Sum owner points maps across several matchday documents.
 */
function aggregateOwnerPoints(matchdayList) {
  const out = {};
  for (const md of matchdayList) {
    const pts = pointsObject(md.points);
    for (const [oid, v] of Object.entries(pts)) {
      out[oid] = (out[oid] || 0) + (Number(v) || 0);
    }
  }
  return out;
}

/**
 * Competition rank (1-based): ties share the same rank (count owners with strictly higher total + 1).
 */
function rankByTotals(ownerIds, getTotal) {
  const rank = {};
  for (const oid of ownerIds) {
    const t = getTotal(oid);
    let higher = 0;
    for (const o2 of ownerIds) {
      if (getTotal(o2) > t) higher += 1;
    }
    rank[oid] = higher + 1;
  }
  return rank;
}

/**
 * @param {{ tournament?: object, owners: object[], players: object[], matchdays: object[] }} input
 */
export function buildHomeDashboard({ tournament, owners, players, matchdays }) {
  const ownerById = Object.fromEntries(owners.map((o) => [o._id, o]));
  const ownersActive = owners.filter((o) => !isUnsoldOwner(o));

  const graphKey = (o) => String(o.shortName || o.name || o._id);

  const totals = {};
  for (const p of players) {
    const oid = p.ownerId;
    if (!oid) continue;
    if (isUnsoldOwner(ownerById[oid])) continue;
    totals[oid] = (totals[oid] || 0) + (Number(p.totalPoints) || 0);
  }

  const leaderboard = ownersActive
    .map((o) => ({
      ownerId: o._id,
      name: o.name,
      shortName: o.shortName,
      primaryColor: o.primaryColor ?? o.color ?? "#64748b",
      secondaryColor: o.secondaryColor ?? "#94a3b8",
      total: totals[o._id] ?? 0,
      rowClass: sanitizeRowClass(graphKey(o)),
    }))
    .sort((a, b) => b.total - a.total);

  const sortedMds = [...matchdays].sort(
    (a, b) => Number(a.matchNumber) - Number(b.matchNumber)
  );

  const ownerIdsForRank = ownersActive.map((o) => o._id);
  let rankPrev = {};
  let rankNow = {};
  if (sortedMds.length >= 2) {
    const cumThroughPrev = aggregateOwnerPoints(sortedMds.slice(0, -1));
    const cumThroughLatest = aggregateOwnerPoints(sortedMds);
    rankPrev = rankByTotals(ownerIdsForRank, (oid) => cumThroughPrev[oid] ?? 0);
    rankNow = rankByTotals(ownerIdsForRank, (oid) => cumThroughLatest[oid] ?? 0);
  }

  const withDiff = leaderboard.map((row, i, arr) => ({
    ...row,
    difference: i > 0 ? row.total - arr[i - 1].total : null,
    positionChange:
      sortedMds.length < 2
        ? null
        : (rankPrev[row.ownerId] ?? 0) - (rankNow[row.ownerId] ?? 0),
  }));

  const latest = sortedMds[sortedMds.length - 1];
  const matchdaysForToday = matchdaysOnLatestCalendarDay(sortedMds);
  const latestPts = aggregateOwnerPoints(matchdaysForToday);

  const todayPoints = Object.entries(latestPts)
    .filter(([oid]) => !isUnsoldOwner(ownerById[oid]))
    .map(([oid, v]) => {
      const o = ownerById[oid];
      const shortName = o?.shortName ?? o?.name ?? oid;
      return {
        ownerId: oid,
        shortName,
        points: Number(v) || 0,
        primaryColor: o?.primaryColor ?? "#64748b",
        secondaryColor: o?.secondaryColor ?? "#94a3b8",
      };
    })
    .sort((a, b) => b.points - a.points);

  const todayPointsTuples = todayPoints.map((t) => [t.shortName, t.points]);

  /** Cumulative owner totals after each matchday (for line chart). */
  const cumulative = {};
  const graphRows = [];
  for (const md of sortedMds) {
    const pts = pointsObject(md.points);
    for (const [oid, v] of Object.entries(pts)) {
      cumulative[oid] = (cumulative[oid] || 0) + (Number(v) || 0);
    }
    const row = { date: `Match ${md.matchNumber}` };
    for (const o of ownersActive) {
      row[graphKey(o)] = Number(cumulative[o._id] || 0);
    }
    graphRows.push(row);
  }

  const graphSlice = graphRows.slice(-10);

  const matchTotal =
    Number(tournament?.matches?.total) ||
    Number(tournament?.totalMatches) ||
    74;
  const latestMn = latest ? Number(latest.matchNumber) : 0;
  const matchesLeft = Math.max(0, matchTotal - latestMn);

  const stages = Array.isArray(tournament?.matches?.stages)
    ? tournament.matches.stages
    : [
        { label: "League", count: 35 },
        { label: "Half", count: 35 },
        { label: "Playoffs", count: 4 },
      ];

  /** Match numbers for the same calendar day as the latest matchday (today points + highest contributor). */
  const matchNumbers = matchdaysForToday
    .map((md) => Number(md.matchNumber))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  const ownerColors = Object.fromEntries(
    ownersActive.map((o) => {
      const primary = o.primaryColor ?? o.color ?? "#64748b";
      const secondary = o.secondaryColor ?? "#94a3b8";
      return [graphKey(o), graphLineColor(primary, secondary)];
    })
  );

  return {
    leaderboard: withDiff,
    todayPoints: todayPointsTuples,
    todayPointsMeta: todayPoints,
    graphData: graphSlice,
    graphOwners: ownersActive.map((o) => graphKey(o)),
    ownerColors,
    matchesLeft,
    matchTotal,
    stages,
    latestMatchNumber: latestMn,
    players,
    matchNumbers,
    ownerById,
  };
}

export function sumPlayerFinalForMatches(player, matchNums) {
  const keys = new Set(matchNums.map((n) => String(n)));
  let s = 0;
  const pts = pointsObject(player.points);
  for (const [k, v] of Object.entries(pts)) {
    if (!keys.has(k)) continue;
    if (v && typeof v.final === "number" && !Number.isNaN(v.final)) s += v.final;
  }
  return s;
}
