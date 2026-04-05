const express = require("express");
const multer = require("multer");
const Player = require("../models/Player");
const Owner = require("../models/Owner");
const { assertPlayerRefs } = require("../lib/playerValidation");
const {
  XLSX,
  sheetToRows,
  parseBool,
  parseNumber,
  str,
} = require("../lib/excelHelpers");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = express.Router();

router.post(
  "/players",
  upload.single("file"),
  async (req, res) => {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Missing file (field name: file)" });
    }
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch (e) {
      return res.status(400).json({ message: `Invalid Excel file: ${e.message}` });
    }

    const { sheetName, rows } = sheetToRows(workbook, ["players"]);
    const errors = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const _id = str(row._id);
      const tournamentId = str(row.tournamentId);
      if (!_id || !tournamentId) {
        errors.push({ row: rowNum, message: "Skip: missing _id or tournamentId" });
        continue;
      }

      try {
        const ownerId = str(row.ownerId);
        const teamCode = str(row.teamCode);
        const name = str(row.name);
        const role = str(row.role);
        const nationality = str(row.nationality);
        const price = parseNumber(row.price);
        const boosterTag = str(row.boosterTag);
        const isInjured = parseBool(row.isInjured);
        const isEliminated = parseBool(row.isEliminated);

        if (!name || !ownerId || !teamCode || !role || !nationality) {
          throw new Error("Missing required column (name, ownerId, teamCode, role, nationality)");
        }
        if (!Number.isFinite(price)) {
          throw new Error(`Invalid price: ${row.price}`);
        }

        await assertPlayerRefs(tournamentId, ownerId, teamCode);

        await Player.findOneAndUpdate(
          { _id, tournamentId },
          {
            $set: {
              name,
              ownerId,
              teamCode,
              role,
              nationality,
              price,
              boosterTag,
              isInjured,
              isEliminated,
            },
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
        imported += 1;
      } catch (e) {
        errors.push({ row: rowNum, _id, message: e.message });
      }
    }

    res.json({
      success: true,
      sheet: sheetName,
      imported,
      failed: errors.length,
      errors: errors.slice(0, 50),
      errorsTruncated: errors.length > 50,
    });
  }
);

router.post(
  "/owners",
  upload.single("file"),
  async (req, res) => {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Missing file (field name: file)" });
    }
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch (e) {
      return res.status(400).json({ message: `Invalid Excel file: ${e.message}` });
    }

    const { sheetName, rows } = sheetToRows(workbook, ["owners"]);
    const errors = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const _id = str(row._id);
      const tournamentId = str(row.tournamentId);
      if (!_id || !tournamentId) {
        errors.push({ row: rowNum, message: "Skip: missing _id or tournamentId" });
        continue;
      }

      try {
        const name = str(row.name);
        const shortName = str(row.shortName);
        const primaryColor = str(row.primaryColor);
        const secondaryColor = str(row.secondaryColor);

        if (!name || !shortName || !primaryColor || !secondaryColor) {
          throw new Error(
            "Missing required column (name, shortName, primaryColor, secondaryColor)"
          );
        }

        await Owner.findOneAndUpdate(
          { _id },
          {
            $set: {
              tournamentId,
              name,
              shortName,
              primaryColor,
              secondaryColor,
            },
          },
          { upsert: true, new: true, runValidators: true }
        );
        imported += 1;
      } catch (e) {
        errors.push({ row: rowNum, _id, message: e.message });
      }
    }

    res.json({
      success: true,
      sheet: sheetName,
      imported,
      failed: errors.length,
      errors: errors.slice(0, 50),
      errorsTruncated: errors.length > 50,
    });
  }
);

module.exports = router;
