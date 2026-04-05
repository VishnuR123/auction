const mongoose = require("mongoose");

const matchDayPointsSchema = new mongoose.Schema(
  {
    base: { type: Number, required: true },
    final: { type: Number, required: true },
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    tournamentId: { type: String, required: true, index: true },

    /** References `owners._id` for this tournament — resolve name/short/colors via owners API. */
    ownerId: { type: String, required: true, index: true },

    /**
     * Franchise code from `tournament.teams` (e.g. CSK, RCB). Not duplicated text.
     */
    teamCode: { type: String, required: true, index: true },

    role: { type: String, required: true },
    nationality: { type: String, required: true },

    price: { type: Number, required: true },

    boosterTag: { type: String, default: "" },

    isInjured: { type: Boolean, default: false },
    isEliminated: { type: Boolean, default: false },

    /**
     * Per-match scoring: keys are match **numbers as strings** (e.g. "1", "6", "74").
     * Non-sequential is fine — only matches that happened are stored.
     */
    points: {
      type: Map,
      of: matchDayPointsSchema,
      default: {},
    },

    totalPoints: { type: Number, default: 0 },
  },
  { collection: "players" }
);

module.exports = mongoose.model("Player", playerSchema);
