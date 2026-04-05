const express = require("express");
const Matchday = require("../models/Matchday");

const router = express.Router();

router.get("/", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const matchdays = await Matchday.find({ tournamentId })
      .sort({ matchNumber: 1 })
      .lean();
    res.json(matchdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/bulk-update", async (req, res) => {
  try {
    const { tournamentId, matchdayIds, isLocked } = req.body;
    if (!tournamentId || !Array.isArray(matchdayIds) || matchdayIds.length === 0) {
      return res.status(400).json({
        message: "tournamentId and non-empty matchdayIds[] are required",
      });
    }
    if (typeof isLocked !== "boolean") {
      return res.status(400).json({ message: "isLocked (boolean) is required" });
    }
    const result = await Matchday.updateMany(
      { tournamentId, _id: { $in: matchdayIds } },
      { $set: { isLocked } }
    );
    res.json({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:matchdayId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const payload = { ...req.body };
    delete payload._id;
    if (payload.points && !(payload.points instanceof Map)) {
      payload.points = new Map(Object.entries(payload.points));
    }
    const doc = await Matchday.findOneAndUpdate(
      { _id: req.params.matchdayId, tournamentId },
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) {
      return res.status(404).json({ message: "Matchday not found" });
    }
    const out = { ...doc };
    if (out.points && out.points instanceof Map) {
      out.points = Object.fromEntries(out.points);
    }
    res.json(out);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:matchdayId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const doc = await Matchday.findOneAndDelete({
      _id: req.params.matchdayId,
      tournamentId,
    }).lean();
    if (!doc) {
      return res.status(404).json({ message: "Matchday not found" });
    }
    res.json({ success: true, deleted: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:matchdayId", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const doc = await Matchday.findOne({
      _id: req.params.matchdayId,
      tournamentId,
    }).lean();
    if (!doc) {
      return res.status(404).json({ message: "Matchday not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
