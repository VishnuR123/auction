const express = require("express");
const Player = require("../models/Player");
const Owner = require("../models/Owner");
const Matchday = require("../models/Matchday");
const Tournament = require("../models/Tournament");
const {
  multiplierForTag,
  sumFinalPointsFromMap,
  aggregateOwnerMatchPoints,
} = require("../lib/scoring");

const router = express.Router();

function matchdayDocId(tournamentId, matchNumber) {
  return `${tournamentId}_match_${matchNumber}`;
}

/** @returns {string|null} YYYY-MM-DD or null if invalid / empty */
function normalizeMatchDate(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, mo, d] = s.split("-").map(Number);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return s;
}

/**
 * POST /api/match/updateMatch
 * Body: { tournamentId, matchNumber, players: [{ playerId, basePoints }], partial?: boolean }
 *
 * - Full (partial false): fails if matchday exists and is locked. Saves owner totals and locks.
 * - Partial (partial true): matchday must exist and be unlocked. Updates only listed players;
 *   recomputes owner totals; does not lock.
 */
router.post("/updateMatch", async (req, res) => {
  const {
    tournamentId,
    matchNumber,
    players: entries,
    partial,
    matchTeams,
    matchDate: matchDateRaw,
  } = req.body;

  if (!tournamentId || matchNumber === undefined || matchNumber === null) {
    return res.status(400).json({
      message: "tournamentId and matchNumber are required",
    });
  }
  const mn = Number(matchNumber);
  if (!Number.isFinite(mn) || mn < 1 || !Number.isInteger(mn)) {
    return res.status(400).json({ message: "matchNumber must be a positive integer" });
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return res
      .status(400)
      .json({ message: "players must be a non-empty array of { playerId, basePoints }" });
  }

  const isPartial = Boolean(partial);

  try {
    const tournament = await Tournament.findById(tournamentId).lean();
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    const matchCap =
      tournament.matches?.total ?? tournament.totalMatches;
    if (matchCap != null && mn > matchCap) {
      return res.status(400).json({
        message: `matchNumber cannot exceed matches.total (${matchCap})`,
      });
    }

    const boosters = tournament.boosters || [];

    let matchday = await Matchday.findOne({ tournamentId, matchNumber: mn });

    if (isPartial) {
      if (!matchday) {
        return res.status(400).json({
          message:
            "Cannot partial-update: matchday does not exist yet. Use a full update first.",
        });
      }
      if (matchday.isLocked) {
        return res.status(403).json({
          message: "Match is locked. Unlock it before editing.",
          matchday: matchday.toObject(),
        });
      }
    } else if (matchday && matchday.isLocked) {
      return res.status(403).json({
        message: "Match is locked. Unlock it before overwriting.",
        matchday: matchday.toObject(),
      });
    }

    const updatedPlayerIds = [];

    for (const row of entries) {
      const { playerId, basePoints } = row;
      if (!playerId || basePoints === undefined || basePoints === null) {
        return res.status(400).json({
          message: "Each entry needs playerId and basePoints",
        });
      }
      const base = Number(basePoints);
      if (!Number.isFinite(base)) {
        return res.status(400).json({
          message: `Invalid basePoints for player ${playerId}`,
        });
      }

      const player = await Player.findOne({ _id: playerId, tournamentId });
      if (!player) {
        return res.status(404).json({
          message: `Player not found: ${playerId} in tournament ${tournamentId}`,
        });
      }

      const mult = multiplierForTag(boosters, player.boosterTag || "");
      const final = base * mult;
      const key = String(mn);
      player.points.set(key, { base, final });
      player.totalPoints = sumFinalPointsFromMap(player.points);
      await player.save();
      updatedPlayerIds.push(playerId);
    }

    const [playersLean, ownersLean] = await Promise.all([
      Player.find({ tournamentId }).lean(),
      Owner.find({ tournamentId }).lean(),
    ]);
    const ownerTotals = aggregateOwnerMatchPoints(playersLean, ownersLean, mn);

    const pointsMap = new Map(Object.entries(ownerTotals));
    const _id = matchdayDocId(tournamentId, mn);
    const lockAfter = !isPartial;

    const setDoc = {
      points: pointsMap,
      isLocked: lockAfter,
    };

    if (Array.isArray(matchTeams)) {
      if (matchTeams.length !== 2) {
        return res.status(400).json({
          message: "matchTeams must be an array of exactly two team codes",
        });
      }
      const a = String(matchTeams[0] || "").trim();
      const b = String(matchTeams[1] || "").trim();
      if (!a || !b || a === b) {
        return res.status(400).json({
          message: "matchTeams must be two different non-empty team codes",
        });
      }
      const allowed = new Set(tournament.teams || []);
      if (!allowed.has(a) || !allowed.has(b)) {
        return res.status(400).json({
          message: "matchTeams must both be listed on the tournament teams",
        });
      }
      setDoc.matchTeams = [a, b];
    }

    const normalizedMatchDate = normalizeMatchDate(matchDateRaw);
    if (normalizedMatchDate != null) {
      setDoc.matchDate = normalizedMatchDate;
    } else if (matchDateRaw != null && matchDateRaw !== "") {
      return res.status(400).json({
        message: "matchDate must be a valid calendar date as YYYY-MM-DD",
      });
    } else if (!isPartial && !matchday) {
      setDoc.matchDate = new Date().toISOString().slice(0, 10);
    }

    matchday = await Matchday.findOneAndUpdate(
      { tournamentId, matchNumber: mn },
      {
        $set: setDoc,
        $setOnInsert: {
          _id,
          tournamentId,
          matchNumber: mn,
          createdAt: new Date(),
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    const matchdayObj = matchday.toObject();
    if (matchdayObj.points instanceof Map) {
      matchdayObj.points = Object.fromEntries(matchdayObj.points);
    }

    return res.json({
      success: true,
      partial: isPartial,
      updatedPlayerIds,
      matchday: matchdayObj,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /api/match/unlock
 * Body: { tournamentId, matchNumber }
 */
router.patch("/unlock", async (req, res) => {
  const { tournamentId, matchNumber } = req.body;
  if (!tournamentId || matchNumber === undefined) {
    return res
      .status(400)
      .json({ message: "tournamentId and matchNumber are required" });
  }
  const mn = Number(matchNumber);
  try {
    const doc = await Matchday.findOneAndUpdate(
      { tournamentId, matchNumber: mn },
      { $set: { isLocked: false } },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Matchday not found" });
    }
    const o = doc.toObject();
    if (o.points instanceof Map) o.points = Object.fromEntries(o.points);
    res.json({ success: true, matchday: o });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /api/match/lock
 * Body: { tournamentId, matchNumber }
 */
router.patch("/lock", async (req, res) => {
  const { tournamentId, matchNumber } = req.body;
  if (!tournamentId || matchNumber === undefined) {
    return res
      .status(400)
      .json({ message: "tournamentId and matchNumber are required" });
  }
  const mn = Number(matchNumber);
  try {
    const doc = await Matchday.findOneAndUpdate(
      { tournamentId, matchNumber: mn },
      { $set: { isLocked: true } },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Matchday not found" });
    }
    const o = doc.toObject();
    if (o.points instanceof Map) o.points = Object.fromEntries(o.points);
    res.json({ success: true, matchday: o });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
