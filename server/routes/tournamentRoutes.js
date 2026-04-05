const express = require("express");
const Tournament = require("../models/Tournament");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ name: 1 }).lean();
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/bulk-update", async (req, res) => {
  try {
    const { tournamentIds, isActive } = req.body;
    if (!Array.isArray(tournamentIds) || tournamentIds.length === 0) {
      return res.status(400).json({
        message: "Non-empty tournamentIds[] is required",
      });
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }
    const result = await Tournament.updateMany(
      { _id: { $in: tournamentIds } },
      { $set: { isActive } }
    );
    res.json({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/:tournamentId", async (req, res) => {
  try {
    const doc = await Tournament.findById(req.params.tournamentId).lean();
    if (!doc) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = new Tournament(req.body);
    await doc.save();
    res.status(201).json(doc.toObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:tournamentId", async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    const doc = await Tournament.findByIdAndUpdate(
      req.params.tournamentId,
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:tournamentId", async (req, res) => {
  try {
    const doc = await Tournament.findByIdAndDelete(req.params.tournamentId).lean();
    if (!doc) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json({ success: true, deleted: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
