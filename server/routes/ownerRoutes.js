const express = require("express");
const Owner = require("../models/Owner");

const router = express.Router();

/** Accept legacy `color` from old clients / documents; store as `primaryColor`. */
function normalizeOwnerPayload(body) {
  const p = { ...body };
  if (p.primaryColor == null && p.color != null) {
    p.primaryColor = p.color;
  }
  delete p.color;
  return p;
}

router.get("/", async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId) {
    return res
      .status(400)
      .json({ message: "Query parameter tournamentId is required" });
  }
  try {
    const owners = await Owner.find({ tournamentId }).sort({ name: 1 }).lean();
    res.json(
      owners.map((o) => ({
        ...o,
        primaryColor: o.primaryColor ?? o.color,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = new Owner(normalizeOwnerPayload(req.body));
    await doc.save();
    res.status(201).json(doc.toObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const BULK_OWNER_FIELDS = ["primaryColor", "secondaryColor", "shortName"];

router.post("/bulk-update", async (req, res) => {
  try {
    const { tournamentId, ownerIds, updates } = req.body;
    if (!tournamentId || !Array.isArray(ownerIds) || ownerIds.length === 0) {
      return res.status(400).json({
        message: "tournamentId and non-empty ownerIds[] are required",
      });
    }
    const patch = {};
    for (const k of BULK_OWNER_FIELDS) {
      if (updates && Object.prototype.hasOwnProperty.call(updates, k)) {
        patch[k] = updates[k];
      }
    }
    if (Object.keys(patch).length !== 1) {
      return res.status(400).json({
        message: `Send exactly one of: ${BULK_OWNER_FIELDS.join(", ")}`,
      });
    }
    const result = await Owner.updateMany(
      { tournamentId, _id: { $in: ownerIds } },
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

router.put("/:ownerId", async (req, res) => {
  try {
    const doc = await Owner.findByIdAndUpdate(
      req.params.ownerId,
      { $set: normalizeOwnerPayload(req.body) },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) {
      return res.status(404).json({ message: "Owner not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:ownerId", async (req, res) => {
  try {
    const doc = await Owner.findByIdAndDelete(req.params.ownerId).lean();
    if (!doc) {
      return res.status(404).json({ message: "Owner not found" });
    }
    res.json({ success: true, deleted: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
