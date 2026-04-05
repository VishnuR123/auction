const mongoose = require("mongoose");

const matchdaySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    tournamentId: { type: String, required: true, index: true },
    matchNumber: { type: Number, required: true },

    points: {
      type: Map,
      of: Number,
      required: true,
    },

    isLocked: { type: Boolean, default: false },

    /**
     * The two franchise codes that played this match (from tournament.teams),
     * set when scoring from the admin “Update match” flow.
     */
    matchTeams: { type: [String], default: [] },

    /** Calendar day the match was played (YYYY-MM-DD). Used for “today” aggregation on the public site. */
    matchDate: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          return v == null || v === "" || /^\d{4}-\d{2}-\d{2}$/.test(String(v));
        },
        message: "matchDate must be YYYY-MM-DD",
      },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "matchdays" }
);

matchdaySchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

module.exports = mongoose.model("Matchday", matchdaySchema);
