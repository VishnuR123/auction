const express = require("express");
const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Owner = require("../models/Owner");
const Matchday = require("../models/Matchday");

const router = express.Router();

function isUnsoldOwnerDoc(o) {
  if (!o || typeof o !== "object") return false;
  const id = String(o._id ?? "")
    .trim()
    .toLowerCase();
  const sn = String(o.shortName ?? "")
    .trim()
    .toLowerCase();
  const nm = String(o.name ?? "")
    .trim()
    .toLowerCase();
  return (
    id === "unsold" ||
    sn === "unsold" ||
    nm === "unsold" ||
    id.endsWith("-unsold")
  );
}

/**
 * GET /api/past-results/db-standings
 * Per DB tournament: aggregate player totalPoints by owner, year from earliest matchday.
 */
router.get("/db-standings", async (req, res) => {
  try {
    const tournaments = await Tournament.find().lean();
    const out = [];

    for (const t of tournaments) {
      const tid = t._id;
      const [players, owners, matchdays] = await Promise.all([
        Player.find({ tournamentId: tid }).lean(),
        Owner.find({ tournamentId: tid }).lean(),
        Matchday.find({ tournamentId: tid }).lean(),
      ]);

      const ownerById = Object.fromEntries(
        owners.map((o) => [String(o._id), o])
      );

      const totals = {};
      for (const p of players) {
        const oid = p.ownerId;
        if (!oid) continue;
        if (isUnsoldOwnerDoc(ownerById[oid])) continue;
        totals[oid] = (totals[oid] || 0) + (Number(p.totalPoints) || 0);
      }

      const standings = Object.entries(totals)
        .map(([ownerId, points]) => ({
          ownerId,
          name: ownerById[ownerId]?.name || ownerId,
          points,
        }))
        .sort((a, b) => b.points - a.points);

      const mds = [...matchdays].sort(
        (a, b) => Number(a.matchNumber) - Number(b.matchNumber)
      );
      const first = mds[0];
      let year = new Date().getFullYear();
      if (
        first?.matchDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(first.matchDate).trim())
      ) {
        year = parseInt(String(first.matchDate).slice(0, 4), 10);
      } else if (first?.createdAt) {
        year = new Date(first.createdAt).getFullYear();
      }

      out.push({
        id: tid,
        name: t.name,
        type: String(t.type || "auction").toLowerCase(),
        year,
        firstMatchDate: first?.matchDate || null,
        standings,
      });
    }

    out.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

    res.json({ tournaments: out });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
