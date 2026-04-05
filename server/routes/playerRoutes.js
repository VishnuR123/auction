const express = require("express");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const { assertPlayerRefs } = require("../lib/playerValidation");

const router = express.Router();

const BULK_PLAYER_FIELDS = ["isInjured", "isEliminated", "boosterTag"];

router.get("/", async (req, res) => {
  const { tournamentId, teams } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const filter = { tournamentId };
    if (teams != null && teams !== "") {
      const raw = Array.isArray(teams) ? teams : [teams];
      const codes = raw
        .flatMap((t) => String(t).split(","))
        .map((s) => s.trim())
        .filter(Boolean);
      if (codes.length) {
        filter.teamCode = { $in: codes };
      }
    }
    const players = await Player.find(filter).lean();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:playerId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const player = await Player.findOne({
      _id: req.params.playerId,
      tournamentId,
    }).lean();
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { tournamentId, ownerId, teamCode } = req.body;
    await assertPlayerRefs(tournamentId, ownerId, teamCode);
    const doc = new Player(req.body);
    await doc.save();
    const o = doc.toObject();
    if (o.points instanceof Map) o.points = Object.fromEntries(o.points);
    res.status(201).json(o);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/** Bulk set one metadata field for many players (same tournament). */
router.post("/bulk-update", async (req, res) => {
  try {
    const { tournamentId, playerIds, updates } = req.body;
    if (!tournamentId || !Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({
        message: "tournamentId and non-empty playerIds[] are required",
      });
    }
    const patch = {};
    for (const k of BULK_PLAYER_FIELDS) {
      if (updates && Object.prototype.hasOwnProperty.call(updates, k)) {
        patch[k] = updates[k];
      }
    }
    const keys = Object.keys(patch);
    if (keys.length !== 1) {
      return res.status(400).json({
        message: `Send exactly one of: ${BULK_PLAYER_FIELDS.join(", ")}`,
      });
    }
    const field = keys[0];
    if (field === "boosterTag") {
      const tag = patch.boosterTag;
      if (tag != null && tag !== "") {
        const t = await Tournament.findById(tournamentId).lean();
        if (!t) {
          return res.status(404).json({ message: "Tournament not found" });
        }
        const names = (t.boosters || []).map((b) => b.name);
        if (!names.includes(tag)) {
          return res.status(400).json({
            message: `boosterTag "${tag}" is not defined on this tournament`,
          });
        }
      }
    }
    const result = await Player.updateMany(
      { tournamentId, _id: { $in: playerIds } },
      { $set: patch }
    );
    res.json({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:playerId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.tournamentId;
    if (payload.points && !(payload.points instanceof Map)) {
      payload.points = new Map(Object.entries(payload.points));
    }
    const existing = await Player.findOne({
      _id: req.params.playerId,
      tournamentId,
    }).lean();
    if (!existing) {
      return res.status(404).json({ message: "Player not found" });
    }
    const nextOwnerId = payload.ownerId ?? existing.ownerId;
    const nextTeam =
      payload.teamCode ?? existing.teamCode ?? existing.team;
    await assertPlayerRefs(tournamentId, nextOwnerId, nextTeam);
    const doc = await Player.findOneAndUpdate(
      { _id: req.params.playerId, tournamentId },
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:playerId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const doc = await Player.findOneAndDelete({
      _id: req.params.playerId,
      tournamentId,
    }).lean();
    if (!doc) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json({ success: true, deleted: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
