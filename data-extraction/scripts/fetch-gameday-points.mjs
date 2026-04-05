/**
 * Fetches https://fantasy.iplt20.com/classic/api/feed/gamedayplayers for each gameday ID
 * and merges all players' GamedayPoints into one table (wide CSV + JSON).
 *
 * Requires an authenticated browser session: set IPL_COOKIE from DevTools (see README).
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function loadDotEnv() {
  const p = path.join(ROOT, ".env");
  try {
    const raw = await fs.readFile(p, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (process.env[k] === undefined) process.env[k] = v;
    }
  } catch {
    // optional
  }
}

function parseGamedayIds(spec) {
  if (!spec || !String(spec).trim()) return [];
  const out = new Set();
  for (const part of String(spec).split(",")) {
    const s = part.trim();
    if (!s) continue;
    const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let n = lo; n <= hi; n++) out.add(n);
    } else if (/^\d+$/.test(s)) {
      out.add(Number(s));
    } else {
      console.warn(`Ignoring invalid GAMEDAY_IDS segment: ${s}`);
    }
  }
  return [...out].sort((x, y) => x - y);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  await loadDotEnv();

  const cookie = process.env.IPL_COOKIE?.trim();
  const announcedVersion = process.env.ANNOUNCED_VERSION?.trim();
  const gamedaySpec = process.env.GAMEDAY_IDS?.trim() || "1-70";
  const delayMs = Math.max(0, Number(process.env.REQUEST_DELAY_MS) || 400);
  const outDir = path.join(ROOT, process.env.OUT_DIR || "out");

  if (!cookie) {
    console.error("Missing IPL_COOKIE. Copy from DevTools → Network → a successful API request → Request Headers → cookie");
    process.exit(1);
  }
  if (!announcedVersion) {
    console.error("Missing ANNOUNCED_VERSION. Copy from the gamedayplayers URL query string.");
    process.exit(1);
  }

  const gamedayIds = parseGamedayIds(gamedaySpec);
  if (!gamedayIds.length) {
    console.error("No gameday IDs parsed from GAMEDAY_IDS.");
    process.exit(1);
  }

  const base = "https://fantasy.iplt20.com/classic/api/feed/gamedayplayers";
  const headers = {
    Accept: "application/json",
    "Accept-Language": "en",
    Referer: "https://fantasy.iplt20.com/classic/stats",
    Origin: "https://fantasy.iplt20.com",
    Cookie: cookie,
  };
  const auth = process.env.IPL_AUTHORIZATION?.trim();
  if (auth) headers.Authorization = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;

  /** @type {Map<number, { Id: number, Name: string, TeamShortName?: string, SkillName?: string, points: Record<number, number> }>} */
  const byPlayer = new Map();
  const errors = [];

  for (let idx = 0; idx < gamedayIds.length; idx++) {
    const g = gamedayIds[idx];
    const url = `${base}?lang=en&tourgamedayId=${g}&teamgamedayId=${g}&announcedVersion=${encodeURIComponent(announcedVersion)}`;
    process.stderr.write(`Fetching gameday ${g} (${idx + 1}/${gamedayIds.length})…\n`);

    let res;
    try {
      res = await fetch(url, { headers });
    } catch (e) {
      errors.push({ gamedayId: g, error: String(e) });
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      errors.push({ gamedayId: g, status: res.status, body: text.slice(0, 500) });
      if (delayMs) await sleep(delayMs);
      continue;
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      errors.push({ gamedayId: g, error: `JSON parse: ${e}` });
      if (delayMs) await sleep(delayMs);
      continue;
    }

    const players = json?.Data?.Value?.Players;
    if (!Array.isArray(players)) {
      errors.push({ gamedayId: g, error: "Unexpected response shape (no Data.Value.Players)" });
      if (delayMs) await sleep(delayMs);
      continue;
    }

    for (const p of players) {
      const id = p.Id;
      if (id == null) continue;
      let row = byPlayer.get(id);
      if (!row) {
        row = {
          Id: id,
          Name: p.Name ?? "",
          TeamShortName: p.TeamShortName,
          SkillName: p.SkillName,
          points: {},
        };
        byPlayer.set(id, row);
      }
      const pts = Number(p.GamedayPoints);
      row.points[g] = Number.isFinite(pts) ? pts : 0;
    }

    if (delayMs && idx < gamedayIds.length - 1) await sleep(delayMs);
  }

  await fs.mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const playersArr = [...byPlayer.values()].sort((a, b) => a.Id - b.Id);
  const jsonOut = {
    meta: {
      source: "gamedayplayers",
      announcedVersion,
      gamedayIds,
      fetchedAt: new Date().toISOString(),
      playerCount: playersArr.length,
    },
    errors,
    players: playersArr.map((r) => ({
      ...r,
      pointsByGameday: r.points,
    })),
  };

  await fs.writeFile(path.join(outDir, `player-points-${stamp}.json`), JSON.stringify(jsonOut, null, 2), "utf8");

  const header = [
    "playerId",
    "name",
    "team",
    "role",
    ...gamedayIds.map((g) => `gameday_${g}`),
  ];
  const lines = [header.join(",")];
  for (const r of playersArr) {
    const cells = [
      r.Id,
      csvEscape(r.Name),
      csvEscape(r.TeamShortName ?? ""),
      csvEscape(r.SkillName ?? ""),
      ...gamedayIds.map((g) => {
        const v = r.points[g];
        return v == null ? "" : v;
      }),
    ];
    lines.push(cells.join(","));
  }
  await fs.writeFile(path.join(outDir, `player-points-${stamp}.csv`), lines.join("\n"), "utf8");

  if (errors.length) {
    await fs.writeFile(path.join(outDir, `errors-${stamp}.json`), JSON.stringify(errors, null, 2), "utf8");
    console.error(`\nCompleted with ${errors.length} gameday errors. See out/errors-${stamp}.json`);
  } else {
    console.error("\nAll gameday requests succeeded.");
  }
  console.error(`Wrote:\n  ${path.join(outDir, `player-points-${stamp}.json`)}\n  ${path.join(outDir, `player-points-${stamp}.csv`)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
