const express = require("express");

const router = express.Router();

const IPL_URL =
  "https://fantasy.iplt20.com/classic/api/feed/gamedayplayers";

/**
 * Proxies the official fantasy stats feed so the admin UI can call same-origin API.
 * Body: { cookie, announcedVersion, gamedayId }
 */
router.post("/gameday-players", async (req, res) => {
  try {
    const { cookie, announcedVersion, gamedayId } = req.body || {};
    if (!cookie || typeof cookie !== "string" || !cookie.trim()) {
      return res.status(400).json({ message: "cookie is required" });
    }
    if (
      typeof announcedVersion !== "string" ||
      !String(announcedVersion).trim()
    ) {
      return res.status(400).json({ message: "announcedVersion is required" });
    }
    const gid = Number(gamedayId);
    if (!Number.isFinite(gid) || gid < 1) {
      return res
        .status(400)
        .json({ message: "gamedayId must be a positive number (use Match #)" });
    }

    const url = `${IPL_URL}?lang=en&tourgamedayId=${gid}&teamgamedayId=${gid}&announcedVersion=${encodeURIComponent(
      String(announcedVersion).trim()
    )}`;

    const r = await fetch(url, {
      headers: {
        Accept: "application/json",
        Cookie: cookie.trim(),
        Referer: "https://fantasy.iplt20.com/classic/stats",
        Origin: "https://fantasy.iplt20.com",
      },
    });

    const text = await r.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({
        message: "IPL response was not JSON",
        detail: text.slice(0, 300),
      });
    }

    if (!r.ok) {
      return res.status(502).json({
        message: `IPL HTTP ${r.status}`,
        body: json,
      });
    }

    const players = json?.Data?.Value?.Players;
    if (!Array.isArray(players)) {
      return res.status(502).json({
        message: "Unexpected IPL response (missing Data.Value.Players)",
      });
    }

    res.json({
      players: players.map((p) => ({
        id: p.Id,
        name: p.Name,
        teamShortName: p.TeamShortName,
        gamedayPoints:
          typeof p.GamedayPoints === "number"
            ? p.GamedayPoints
            : Number(p.GamedayPoints) || 0,
      })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Proxy error" });
  }
});

module.exports = router;
