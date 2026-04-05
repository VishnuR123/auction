/**
 * Parse `public/past-results-old-tournaments.json` shape:
 * { [key]: { name, year, type, data: [{ name, points, ownerId }] } }
 */
export function parseOldTournamentsJson(raw) {
  if (!raw || typeof raw !== "object") return [];
  const entries = [];
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    const { name, year, type, data } = val;
    if (!Array.isArray(data)) continue;
    entries.push({
      source: "json",
      key,
      id: key,
      displayName: name || key,
      year: Number(year) || 0,
      type: String(type || "auction").toLowerCase(),
      firstMatchDate: null,
      standings: data.map((row) => ({
        ownerId: String(row.ownerId ?? "").trim() || String(row.name ?? ""),
        name: row.name,
        points: Number(row.points) || 0,
      })),
    });
  }
  return entries;
}

/** Merge JSON + DB tournament rows; sort by year desc, then name. */
export function mergeTournamentLists(jsonEntries, dbTournaments) {
  const dbItems = (dbTournaments || []).map((t) => ({
    source: "db",
    key: `db:${t.id}`,
    id: t.id,
    displayName: t.name,
    year: Number(t.year) || 0,
    type: String(t.type || "auction").toLowerCase(),
    firstMatchDate: t.firstMatchDate ?? null,
    standings: (t.standings || []).map((row) => ({
      ownerId: String(row.ownerId ?? "").trim(),
      name: row.name,
      points: Number(row.points) || 0,
    })),
  }));

  const all = [...jsonEntries, ...dbItems];
  all.sort((a, b) => b.year - a.year || a.displayName.localeCompare(b.displayName));
  return all;
}

/**
 * Sum points by ownerId across all tournaments (JSON + DB).
 */
export function buildCumulativeTotals(allTournaments) {
  const map = new Map();
  for (const t of allTournaments) {
    for (const row of t.standings) {
      const key = row.ownerId || row.name;
      if (!key) continue;
      const prev = map.get(key) || {
        ownerId: row.ownerId || key,
        name: row.name,
        points: 0,
      };
      prev.points += row.points;
      if (row.name) prev.name = row.name;
      map.set(key, prev);
    }
  }
  return [...map.values()].sort((a, b) => b.points - a.points);
}
